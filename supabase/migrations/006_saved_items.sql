-- Saved Items (user favorites/wishlist)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

-- Create index on saved items
CREATE INDEX idx_saved_items_buyer_id ON saved_items(buyer_id);
CREATE INDEX idx_saved_items_product_id ON saved_items(product_id);

-- Enable Row Level Security
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Saved Items: Users can manage their own saved items
CREATE POLICY "Users can view their own saved items"
  ON saved_items FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own saved items"
  ON saved_items FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can delete their own saved items"
  ON saved_items FOR DELETE
  USING (auth.uid() = buyer_id);

