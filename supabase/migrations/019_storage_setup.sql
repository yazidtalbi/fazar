-- Storage Bucket Setup for Afus Marketplace
-- This migration sets up the required storage buckets and policies

-- Create product-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true, -- Public read access
  104857600, -- 100MB limit (for videos)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create review-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true, -- Public read access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create store-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-media',
  'store-media',
  true, -- Public read access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for product-media bucket
-- Public read access
CREATE POLICY "Public read access for product-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Authenticated write access (sellers only)
CREATE POLICY "Sellers can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

-- Sellers can update their own product media
CREATE POLICY "Sellers can update their product media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

-- Sellers can delete their own product media
CREATE POLICY "Sellers can delete their product media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

-- Storage Policies for review-images bucket
-- Public read access
CREATE POLICY "Public read access for review-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- Authenticated write access (buyers who have ordered the product)
CREATE POLICY "Buyers can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.buyer_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- Storage Policies for store-media bucket
-- Public read access
CREATE POLICY "Public read access for store-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-media');

-- Authenticated write access (store owners only)
CREATE POLICY "Store owners can upload store media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

-- Store owners can update their store media
CREATE POLICY "Store owners can update their store media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

-- Store owners can delete their store media
CREATE POLICY "Store owners can delete their store media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);

