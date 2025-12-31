-- Credits/Coins system for promotions

-- User credits balance
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- Credit transactions (purchases and usage)
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'promotion_spend', 'refund')),
  description TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  promotion_duration_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_product_id ON credit_transactions(product_id);

-- Promotion pricing (cost per day)
CREATE TABLE promotion_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  min_days INTEGER NOT NULL DEFAULT 1,
  max_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default promotion pricing
INSERT INTO promotion_pricing (price_per_day, min_days, max_days) 
VALUES (10.00, 1, 30);

-- Credit packages (predefined purchase options)
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credits_amount DECIMAL(10, 2) NOT NULL,
  price_mad DECIMAL(10, 2) NOT NULL,
  bonus_credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits_amount, price_mad, bonus_credits, order_index) VALUES
  ('Starter', 50.00, 50.00, 0, 1),
  ('Popular', 120.00, 100.00, 20.00, 2),
  ('Pro', 300.00, 250.00, 50.00, 3),
  ('Enterprise', 650.00, 500.00, 150.00, 4);

