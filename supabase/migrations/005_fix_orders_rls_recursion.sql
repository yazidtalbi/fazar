-- Fix infinite recursion in orders RLS policy
-- The issue: When a user has both buyer and seller profiles, SELECT policies are evaluated
-- and the seller policy checking order_items causes recursion during order creation
-- 
-- Solution: Use a SECURITY DEFINER function to create orders, bypassing RLS for the insert/select

-- Create a function to insert orders and return the ID
-- This function runs with the privileges of the function creator (postgres/admin)
-- so it bypasses RLS, preventing recursion
-- Security: The function validates that p_buyer_id matches the authenticated user
CREATE OR REPLACE FUNCTION create_order_with_id(
  p_buyer_id UUID,
  p_order_number TEXT,
  p_payment_method TEXT,
  p_shipping_method TEXT,
  p_shipping_address TEXT,
  p_subtotal DECIMAL,
  p_shipping_cost DECIMAL,
  p_tax DECIMAL,
  p_total DECIMAL,
  p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Security check: ensure the buyer_id matches the authenticated user
  IF p_buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'buyer_id must match authenticated user';
  END IF;

  INSERT INTO orders (
    buyer_id,
    order_number,
    payment_method,
    shipping_method,
    shipping_address,
    subtotal,
    shipping_cost,
    tax,
    total,
    status
  ) VALUES (
    p_buyer_id,
    p_order_number,
    p_payment_method,
    p_shipping_method,
    p_shipping_address,
    p_subtotal,
    p_shipping_cost,
    p_tax,
    p_total,
    p_status
  )
  RETURNING id INTO v_order_id;
  
  RETURN v_order_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order_with_id TO authenticated;

-- Create a function to insert order items
-- This avoids RLS recursion when checking if the order belongs to the buyer
CREATE OR REPLACE FUNCTION insert_order_items(
  p_order_items JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  v_order_id UUID;
  v_buyer_id UUID;
BEGIN
  -- Check if array is empty
  IF jsonb_array_length(p_order_items) = 0 THEN
    RETURN;
  END IF;
  
  -- Get the order_id from the first item (all items should have the same order_id)
  item := p_order_items->0;
  v_order_id := (item->>'order_id')::UUID;
  
  -- Verify the order belongs to the authenticated user (bypasses RLS in SECURITY DEFINER context)
  SELECT buyer_id INTO v_buyer_id
  FROM orders
  WHERE id = v_order_id;
  
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'Order does not belong to authenticated user';
  END IF;
  
  -- Insert all order items
  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price_at_purchase
    ) VALUES (
      (item->>'order_id')::UUID,
      (item->>'product_id')::UUID,
      (item->>'quantity')::INTEGER,
      (item->>'price_at_purchase')::DECIMAL
    );
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_order_items TO authenticated;

-- Create a function to get order by ID for buyers (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_order_by_id(
  p_order_id UUID
)
RETURNS TABLE (
  id UUID,
  buyer_id UUID,
  order_number TEXT,
  status TEXT,
  payment_method TEXT,
  shipping_method TEXT,
  shipping_address TEXT,
  subtotal DECIMAL,
  shipping_cost DECIMAL,
  tax DECIMAL,
  total DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure the order belongs to the authenticated user
  RETURN QUERY
  SELECT 
    o.id,
    o.buyer_id,
    o.order_number,
    o.status,
    o.payment_method,
    o.shipping_method,
    o.shipping_address,
    o.subtotal,
    o.shipping_cost,
    o.tax,
    o.total,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.id = p_order_id
    AND o.buyer_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_order_by_id TO authenticated;

-- Create a function to get order items for an order (bypasses RLS)
CREATE OR REPLACE FUNCTION get_order_items(
  p_order_id UUID
)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  product_id UUID,
  quantity INTEGER,
  price_at_purchase DECIMAL,
  created_at TIMESTAMPTZ,
  product_title TEXT,
  product_media_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id UUID;
BEGIN
  -- Security check: ensure the order belongs to the authenticated user
  SELECT buyer_id INTO v_buyer_id
  FROM orders
  WHERE orders.id = p_order_id;
  
  IF v_buyer_id IS NULL OR v_buyer_id != auth.uid() THEN
    RETURN; -- Return empty if order doesn't belong to user
  END IF;

  -- Return order items with product information
  RETURN QUERY
  SELECT 
    oi.id::UUID,
    oi.order_id::UUID,
    oi.product_id::UUID,
    oi.quantity::INTEGER,
    oi.price_at_purchase::DECIMAL,
    oi.created_at::TIMESTAMPTZ,
    p.title::TEXT,
    COALESCE(
      (SELECT pm.media_url::TEXT
       FROM product_media pm 
       WHERE pm.product_id = p.id 
         AND (pm.is_cover = true OR pm.order_index = 0)
       ORDER BY pm.is_cover DESC, pm.order_index ASC
       LIMIT 1),
      NULL
    )::TEXT as product_media_url
  FROM order_items oi
  INNER JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id
  ORDER BY oi.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_order_items TO authenticated;

-- Create a function to get orders for a seller (orders that contain their products)
CREATE OR REPLACE FUNCTION get_seller_orders()
RETURNS TABLE (
  id UUID,
  buyer_id UUID,
  order_number TEXT,
  status TEXT,
  payment_method TEXT,
  shipping_method TEXT,
  shipping_address TEXT,
  subtotal DECIMAL,
  shipping_cost DECIMAL,
  tax DECIMAL,
  total DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return orders that contain products from stores owned by the authenticated seller
  RETURN QUERY
  SELECT DISTINCT
    o.id,
    o.buyer_id,
    o.order_number,
    o.status,
    o.payment_method,
    o.shipping_method,
    o.shipping_address,
    o.subtotal,
    o.shipping_cost,
    o.tax,
    o.total,
    o.created_at,
    o.updated_at
  FROM orders o
  INNER JOIN order_items oi ON oi.order_id = o.id
  INNER JOIN products p ON p.id = oi.product_id
  INNER JOIN stores s ON s.id = p.store_id
  WHERE s.seller_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_seller_orders TO authenticated;

-- Create a function to get order items for a seller's products in a specific order
CREATE OR REPLACE FUNCTION get_seller_order_items(
  p_order_id UUID
)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  product_id UUID,
  quantity INTEGER,
  price_at_purchase DECIMAL,
  created_at TIMESTAMPTZ,
  product_title TEXT,
  product_media_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return order items for products from stores owned by the authenticated seller
  RETURN QUERY
  SELECT 
    oi.id::UUID,
    oi.order_id::UUID,
    oi.product_id::UUID,
    oi.quantity::INTEGER,
    oi.price_at_purchase::DECIMAL,
    oi.created_at::TIMESTAMPTZ,
    p.title::TEXT,
    COALESCE(
      (SELECT pm.media_url::TEXT
       FROM product_media pm 
       WHERE pm.product_id = p.id 
         AND (pm.is_cover = true OR pm.order_index = 0)
       ORDER BY pm.is_cover DESC, pm.order_index ASC
       LIMIT 1),
      NULL
    )::TEXT as product_media_url
  FROM order_items oi
  INNER JOIN products p ON p.id = oi.product_id
  INNER JOIN stores s ON s.id = p.store_id
  WHERE oi.order_id = p_order_id
    AND s.seller_id = auth.uid()
  ORDER BY oi.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_seller_order_items TO authenticated;

-- Create a function to update order status for sellers
CREATE OR REPLACE FUNCTION update_order_status_for_seller(
  p_order_id UUID,
  p_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the seller has products in this order
  IF NOT EXISTS (
    SELECT 1
    FROM order_items oi
    INNER JOIN products p ON p.id = oi.product_id
    INNER JOIN stores s ON s.id = p.store_id
    WHERE oi.order_id = p_order_id
      AND s.seller_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Order does not contain products from your store';
  END IF;

  -- Validate status
  IF p_status NOT IN ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Update the order status
  UPDATE orders
  SET status = p_status, updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_order_status_for_seller TO authenticated;

-- Create a function to get a single order for a seller
CREATE OR REPLACE FUNCTION get_seller_order_by_id(
  p_order_id UUID
)
RETURNS TABLE (
  id UUID,
  buyer_id UUID,
  order_number TEXT,
  status TEXT,
  payment_method TEXT,
  shipping_method TEXT,
  shipping_address TEXT,
  subtotal DECIMAL,
  shipping_cost DECIMAL,
  tax DECIMAL,
  total DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return order that contains products from stores owned by the authenticated seller
  RETURN QUERY
  SELECT DISTINCT
    o.id,
    o.buyer_id,
    o.order_number,
    o.status,
    o.payment_method,
    o.shipping_method,
    o.shipping_address,
    o.subtotal,
    o.shipping_cost,
    o.tax,
    o.total,
    o.created_at,
    o.updated_at
  FROM orders o
  INNER JOIN order_items oi ON oi.order_id = o.id
  INNER JOIN products p ON p.id = oi.product_id
  INNER JOIN stores s ON s.id = p.store_id
  WHERE o.id = p_order_id
    AND s.seller_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_seller_order_by_id TO authenticated;

