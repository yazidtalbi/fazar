-- Insert initial categories
INSERT INTO categories (name, slug, description) VALUES
  ('Rugs & Kilims', 'rugs-kilims', 'Traditional Moroccan rugs and kilims'),
  ('Ceramics', 'ceramics', 'Handcrafted ceramic pottery and dishes'),
  ('Leather', 'leather', 'Leather goods and accessories'),
  ('Brass & Metalwork', 'brass-metalwork', 'Traditional brass and metal items'),
  ('Textiles', 'textiles', 'Textiles and fabrics'),
  ('Home Decor', 'home-decor', 'Home decoration items'),
  ('Jewelry', 'jewelry', 'Traditional Moroccan jewelry'),
  ('Accessories', 'accessories', 'Fashion and lifestyle accessories')
ON CONFLICT (slug) DO NOTHING;

