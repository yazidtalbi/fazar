-- Allow public to view seller profiles (specifically for is_verified status)
-- This allows product pages to display verified badges without requiring authentication
CREATE POLICY "Anyone can view seller profiles"
  ON seller_profiles FOR SELECT
  USING (true);

