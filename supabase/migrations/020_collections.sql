-- Global Collections table for custom categories/collections (not store-specific)
-- These are curated collections that can contain promoted products from any store
CREATE TABLE global_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global Collection Products junction table (only promoted products can be added)
CREATE TABLE global_collection_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  global_collection_id UUID NOT NULL REFERENCES global_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_collection_id, product_id)
);

-- Create indexes
CREATE INDEX idx_global_collections_slug ON global_collections(slug);
CREATE INDEX idx_global_collections_is_active ON global_collections(is_active) WHERE is_active = true;
CREATE INDEX idx_global_collection_products_collection_id ON global_collection_products(global_collection_id);
CREATE INDEX idx_global_collection_products_product_id ON global_collection_products(product_id);
CREATE INDEX idx_global_collection_products_order ON global_collection_products(global_collection_id, order_index);

-- Trigger for updated_at
CREATE TRIGGER update_global_collections_updated_at BEFORE UPDATE ON global_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if product is promoted before adding to global collection
CREATE OR REPLACE FUNCTION check_global_collection_product_is_promoted()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM products 
    WHERE id = NEW.product_id 
    AND is_promoted = true
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only promoted and active products can be added to global collections';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce promoted products only
CREATE TRIGGER check_global_collection_product_promoted
  BEFORE INSERT OR UPDATE ON global_collection_products
  FOR EACH ROW EXECUTE FUNCTION check_global_collection_product_is_promoted();

-- Insert initial global collections
INSERT INTO global_collections (name, slug, description, is_active) VALUES
  ('Cadeaux Afus originaux pour La Saint-Valentin', 'cadeaux-saint-valentin', 'Découvrez notre sélection de cadeaux originaux et uniques pour la Saint-Valentin. Des créations artisanales faites avec amour.', true),
  ('Cadeaux pour animaux', 'cadeaux-animaux', 'Spoilez vos animaux de compagnie avec nos cadeaux artisanaux. Des accessoires et jouets faits main pour chiens, chats et plus encore.', true),
  ('Top 100 des essentiels de rentrée', 'essentiels-rentree', 'Tout ce dont vous avez besoin pour une rentrée réussie. Des essentiels pratiques et stylés pour bien commencer l''année.', true),
  ('Meilleures offres du moment', 'meilleures-offres', 'Profitez des meilleures promotions et réductions sur nos produits phares. Des affaires à ne pas manquer !', true),
  ('Idées cadeaux pour elle', 'cadeaux-pour-elle', 'Des cadeaux élégants et raffinés pour faire plaisir aux femmes de votre vie. Bijoux, accessoires et créations uniques.', true),
  ('Idées cadeaux pour lui', 'cadeaux-pour-lui', 'Des cadeaux originaux et stylés pour les hommes. Des pièces uniques qui reflètent leur personnalité.', true),
  ('Déco intérieur tendance', 'deco-interieur-tendance', 'Transformez votre intérieur avec nos créations déco tendance. Des pièces uniques pour une décoration authentique.', true),
  ('Artisanat marocain authentique', 'artisanat-marocain', 'Découvrez l''artisanat marocain dans toute sa splendeur. Des créations traditionnelles revisitées avec modernité.', true),
  ('Cadeaux pour bébé', 'cadeaux-bebe', 'Des cadeaux doux et sûrs pour les tout-petits. Des créations artisanales adaptées aux besoins des bébés.', true),
  ('Mode et accessoires', 'mode-accessoires', 'Restez à la mode avec nos accessoires et vêtements artisanaux. Style et originalité au rendez-vous.', true),
  ('Cuisine et gastronomie', 'cuisine-gastronomie', 'Équipez votre cuisine avec nos ustensiles et accessoires artisanaux. Cuisinez avec style et authenticité.', true),
  ('Bien-être et relaxation', 'bien-etre-relaxation', 'Prenez soin de vous avec nos produits bien-être. Des créations apaisantes pour votre quotidien.', true);

