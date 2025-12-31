-- Update categories to match the new structure
-- This migration ensures the 7 main categories exist with correct names and descriptions
-- Old categories will remain in the database but won't be used going forward

-- Insert/update the 7 main categories using ON CONFLICT
INSERT INTO categories (name, slug, description) VALUES
  ('Jewelry', 'jewelry', 'Handcrafted jewelry pieces including rings, necklaces, earrings, and bracelets'),
  ('Art & Decor', 'art-decor', 'Artwork and decorative pieces including wall art, paintings, calligraphy, and sculptures'),
  ('Beauty & Wellness', 'beauty-wellness', 'Natural beauty and wellness products including skincare, haircare, soaps, candles, and oils'),
  ('Clothing', 'clothing', 'Handcrafted clothing for women, men, and kids'),
  ('Bags & Leather', 'bags-leather', 'Handcrafted bags and leather goods including handbags, backpacks, wallets, and pouches'),
  ('Home & Living', 'home-living', 'Home decor and living essentials including textiles, lighting, and kitchenware'),
  ('Baby & Kids', 'baby-kids', 'Products for babies and kids including clothing, toys, and decor')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Optional: If you want to add the Gifts category later, uncomment this:
-- INSERT INTO categories (name, slug, description) VALUES
--   ('Gifts', 'gifts', 'Curated gift collections including personalized gifts, wedding gifts, and gift boxes')
-- ON CONFLICT (slug) DO UPDATE SET
--   name = EXCLUDED.name,
--   description = EXCLUDED.description;

-- Note: Old categories (like 'rugs-kilims', 'ceramics', 'leather', etc.) will remain in the database
-- but won't be displayed in the UI. Products assigned to old categories will still work,
-- but you may want to manually reassign them to the new categories.
