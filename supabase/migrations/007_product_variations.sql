-- Product Variations
-- Allows products to have multiple variations (e.g., color, size, style)

CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Couleur principale", "Couleur de la fleur", "Size"
  display_name TEXT, -- e.g., "Main Color", "Flower Color"
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Variation Options (e.g., "Style 1", "Style 2", "Red", "Blue")
CREATE TABLE product_variation_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
  value TEXT NOT NULL, -- e.g., "Style 1", "Red", "Large"
  display_value TEXT, -- Optional display name
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Additional price for this option
  stock_quantity INTEGER, -- Stock for this specific variation option
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Personalizations
-- Allows sellers to add personalization options (e.g., custom name, message)
CREATE TABLE product_personalizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., "Add a personalization"
  placeholder TEXT, -- e.g., "Enter name or message"
  max_length INTEGER DEFAULT 100,
  is_required BOOLEAN NOT NULL DEFAULT false,
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Additional price for personalization
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add promoted_price field to products for sale prices
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS promoted_price DECIMAL(10, 2) CHECK (promoted_price >= 0);

-- Create indexes
CREATE INDEX idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX idx_product_variations_order ON product_variations(product_id, order_index);
CREATE INDEX idx_product_variation_options_variation_id ON product_variation_options(variation_id);
CREATE INDEX idx_product_variation_options_order ON product_variation_options(variation_id, order_index);
CREATE INDEX idx_product_personalizations_product_id ON product_personalizations(product_id);
CREATE INDEX idx_product_personalizations_order ON product_personalizations(product_id, order_index);

-- Add trigger for updated_at
CREATE TRIGGER update_product_variations_updated_at BEFORE UPDATE ON product_variations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_personalizations_updated_at BEFORE UPDATE ON product_personalizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

