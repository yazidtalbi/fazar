-- Fix notification triggers to ensure they work properly
-- The triggers need to use SECURITY DEFINER to bypass RLS when inserting notifications

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_order_received_notification ON orders;
DROP TRIGGER IF EXISTS trigger_order_status_change_notification ON orders;
DROP TRIGGER IF EXISTS trigger_new_product_notification ON products;
DROP TRIGGER IF EXISTS trigger_new_message_notification ON messages;

-- Drop existing functions
DROP FUNCTION IF EXISTS notify_order_received();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS notify_new_product();
DROP FUNCTION IF EXISTS notify_new_message();

-- Recreate function to create notification for order received (seller)
CREATE OR REPLACE FUNCTION notify_order_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id UUID;
  v_seller_id UUID;
  v_order_number TEXT;
BEGIN
  -- Get store and seller from order items
  SELECT DISTINCT p.store_id, s.seller_id, NEW.order_number
  INTO v_store_id, v_seller_id, v_order_number
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN stores s ON s.id = p.store_id
  WHERE oi.order_id = NEW.id
  LIMIT 1;

  IF v_seller_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_seller_id,
      'order_received',
      'New Order Received',
      'You have received a new order: ' || v_order_number,
      jsonb_build_object('order_id', NEW.id, 'order_number', v_order_number)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION notify_order_received() TO authenticated;

-- Trigger for order received notifications
CREATE TRIGGER trigger_order_received_notification
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_received();

-- Recreate function to create notification for order status change (buyer)
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.buyer_id,
      'order_status_change',
      'Order Status Updated',
      'Your order ' || NEW.order_number || ' status has been updated to: ' || NEW.status,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION notify_order_status_change() TO authenticated;

-- Trigger for order status change notifications
CREATE TRIGGER trigger_order_status_change_notification
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (NEW.status != OLD.status)
EXECUTE FUNCTION notify_order_status_change();

-- Recreate function to create notification for new product (followers)
CREATE OR REPLACE FUNCTION notify_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if product is active
  IF NEW.status = 'active' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
      f.user_id,
      'new_product',
      'New Product Available',
      'A store you follow has added a new product: ' || NEW.title,
      jsonb_build_object('product_id', NEW.id, 'store_id', NEW.store_id)
    FROM follows f
    WHERE f.store_id = NEW.store_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION notify_new_product() TO authenticated;

-- Trigger for new product notifications
CREATE TRIGGER trigger_new_product_notification
AFTER INSERT ON products
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION notify_new_product();

-- Recreate function to create notification for new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  -- Create notification for receiver
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message',
    'You have received a new message',
    jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id)
  );

  RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION notify_new_message() TO authenticated;

-- Trigger for new message notifications
CREATE TRIGGER trigger_new_message_notification
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();

