-- Create a function to get all orders for a buyer (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_buyer_orders(
  p_limit INTEGER DEFAULT 10,
  p_status TEXT DEFAULT NULL
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
  -- Security check: ensure orders belong to the authenticated user
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
  WHERE o.buyer_id = auth.uid()
    AND (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_buyer_orders TO authenticated;

