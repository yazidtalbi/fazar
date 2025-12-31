-- Enable RLS on credits tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_pricing ENABLE ROW LEVEL SECURITY;

-- User credits policies
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Credit packages policies (public read for active packages)
CREATE POLICY "Anyone can view active credit packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Promotion pricing policies (public read for active pricing)
CREATE POLICY "Anyone can view active promotion pricing"
  ON promotion_pricing FOR SELECT
  USING (is_active = true);

