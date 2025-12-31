-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Policy: Buyers can insert their own reviews
CREATE POLICY "Buyers can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Policy: Buyers can update their own reviews
CREATE POLICY "Buyers can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Policy: Buyers can delete their own reviews
CREATE POLICY "Buyers can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = buyer_id);

