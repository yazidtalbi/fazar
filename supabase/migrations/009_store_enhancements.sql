-- Add city to stores
ALTER TABLE stores
ADD COLUMN city TEXT;

-- Add is_featured field to products (for pinned/featured items)
ALTER TABLE products
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = true;

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_store_id ON collections(store_id);

-- Collection products (many-to-many relationship)
CREATE TABLE collection_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, product_id)
);

CREATE INDEX idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX idx_collection_products_product_id ON collection_products(product_id);

