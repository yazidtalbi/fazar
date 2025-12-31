-- Follows table (users can follow stores)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_store_id ON follows(store_id);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_received', 'order_status_change', 'new_product', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Conversations table (simple messaging between users)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (participant_1 != participant_2)
);

CREATE UNIQUE INDEX idx_conversations_participants ON conversations(
  LEAST(participant_1, participant_2),
  GREATEST(participant_1, participant_2)
);

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user1 UUID, p_user2 UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (participant_1 = p_user1 AND participant_2 = p_user2)
     OR (participant_1 = p_user2 AND participant_2 = p_user1)
  LIMIT 1;

  -- If not found, create a new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (LEAST(p_user1, p_user2), GREATEST(p_user1, p_user2))
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Function to create notification for order received (seller)
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

-- Trigger for order received notifications
CREATE TRIGGER trigger_order_received_notification
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_received();

-- Function to create notification for order status change (buyer)
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

-- Trigger for order status change notifications
CREATE TRIGGER trigger_order_status_change_notification
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (NEW.status != OLD.status)
EXECUTE FUNCTION notify_order_status_change();

-- Function to create notification for new product (followers)
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

-- Trigger for new product notifications
CREATE TRIGGER trigger_new_product_notification
AFTER INSERT ON products
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION notify_new_product();

-- Function to create notification for new message
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

-- Trigger for new message notifications
CREATE TRIGGER trigger_new_message_notification
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();

