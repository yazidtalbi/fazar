# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for the Afus marketplace.

## Quick Setup

The easiest way to set up storage is to run the migration:

```bash
# Apply the storage setup migration
# In Supabase SQL Editor, run:
supabase/migrations/019_storage_setup.sql
```

This migration will:
- Create three storage buckets: `product-media`, `review-images`, `store-media`
- Set up public read access for all buckets
- Configure authenticated write access with proper security policies

## Manual Setup

If you prefer to set up storage manually:

### 1. Create Storage Buckets

Go to **Storage** in your Supabase dashboard and create these buckets:

#### product-media
- **Name**: `product-media`
- **Public**: ✅ Yes (public read access)
- **File size limit**: 100 MB
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
  - `video/mp4`
  - `video/webm`
  - `video/quicktime`

#### review-images
- **Name**: `review-images`
- **Public**: ✅ Yes (public read access)
- **File size limit**: 5 MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

#### store-media
- **Name**: `store-media`
- **Public**: ✅ Yes (public read access)
- **File size limit**: 10 MB
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

### 2. Configure Storage Policies

For each bucket, set up the following policies:

#### product-media Policies

**Public Read Access**
```sql
CREATE POLICY "Public read access for product-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');
```

**Seller Upload Access**
```sql
CREATE POLICY "Sellers can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE seller_id = auth.uid()
  )
);
```

**Seller Update/Delete Access**
Similar policies for UPDATE and DELETE operations (see migration file for full SQL).

#### review-images Policies

**Public Read Access**
```sql
CREATE POLICY "Public read access for review-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');
```

**Buyer Upload Access** (only for products they've ordered)
```sql
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
```

#### store-media Policies

Similar to product-media, but for store logos and cover images.

## Verification

After setting up storage, verify it works:

1. **Run the verification script:**
   ```bash
   npm run verify-setup
   ```

2. **Test upload manually:**
   - Try uploading a product image through the seller dashboard
   - Check that the file appears in the `product-media` bucket
   - Verify the public URL works

## File Organization

Files are organized in buckets as follows:

### product-media
```
product-media/
  {store_id}/
    {timestamp}-{random}.{ext}
```

### review-images
```
review-images/
  {product_id}/
    {timestamp}-{random}.{ext}
```

### store-media
```
store-media/
  {store_id}/
    {timestamp}-{random}.{ext}
```

## Security Considerations

1. **Public Read Access**: All buckets are public for reading, which is necessary for displaying images/videos on the website.

2. **Authenticated Write Access**: Only authenticated users can upload files, and they can only upload to their own store/product folders.

3. **File Size Limits**: Enforced at the bucket level to prevent abuse.

4. **MIME Type Restrictions**: Only allowed file types can be uploaded.

## Troubleshooting

### "Bucket does not exist" error

- Ensure you've created the bucket in Supabase Storage
- Check the bucket name matches exactly (case-sensitive)
- Verify you're using the correct project

### "Permission denied" error

- Check that storage policies are set up correctly
- Verify the user is authenticated
- Ensure the user owns the store/product they're uploading to

### Files not appearing publicly

- Check that the bucket is set to "Public"
- Verify the public URL is correct
- Check CORS settings if accessing from a different domain

### Upload fails with size error

- Check file size against bucket limits
- Verify the file size limit in bucket settings
- Check the API route file size validation

## Testing Storage

You can test storage functionality with this script:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test public read access
const { data, error } = await supabase.storage
  .from("product-media")
  .list("", { limit: 1 });

if (error) {
  console.error("Storage test failed:", error);
} else {
  console.log("Storage test passed!");
}
```

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)

