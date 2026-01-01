# Quick Start Guide - Pre-Launch Setup

This guide will help you complete the critical pre-launch setup tasks.

## Step 1: Environment Variables

1. Create `.env.local` in the root directory:
   ```bash
   cp .env.local.example .env.local  # if you have an example file
   # or create it manually
   ```

2. Add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

## Step 2: Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_row_level_security.sql`
   - `003_initial_categories.sql`
   - ... (all other migrations)
   - `019_storage_setup.sql` (creates storage buckets)

## Step 3: Storage Setup

The storage setup is included in migration `019_storage_setup.sql`. After running it:

1. Go to **Storage** in Supabase dashboard
2. Verify these buckets exist:
   - `product-media`
   - `review-images`
   - `store-media`
3. Verify they're set to **Public**

See [STORAGE_SETUP.md](./STORAGE_SETUP.md) for detailed instructions.

## Step 4: Verify Setup

Run the verification script:

```bash
npm run verify-setup
```

This will check:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ Storage buckets exist
- ✅ Database tables exist

## Step 5: Test Critical Features

### Test Product Creation
1. Create a seller account
2. Complete store onboarding
3. Create a test product with images
4. Verify images upload and display correctly

### Test Order Flow
1. Create a buyer account
2. Add products to cart
3. Complete checkout
4. Verify order is created
5. Test order status updates (seller side)

### Test Reviews
1. Complete an order
2. Submit a review from order page
3. Verify review appears on product page
4. Verify review appears on store page

## Step 6: Security Check

1. Review RLS policies in Supabase
2. Test that users can only access their own data
3. Test that sellers can only manage their own products
4. Verify protected routes require authentication

## Step 7: Production Deployment

### Vercel Setup

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Production

Make sure to add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Common Issues

### "Bucket does not exist"
- Run migration `019_storage_setup.sql`
- Or create buckets manually in Supabase Storage

### "Permission denied" on uploads
- Check storage policies are set up
- Verify user is authenticated
- Check user owns the store/product

### "Table does not exist"
- Run all database migrations
- Check migration order

### Build fails
- Check TypeScript errors: `npm run build`
- Fix linting errors: `npm run lint`
- Verify all dependencies installed: `npm install`

## Next Steps

After completing the quick start:

1. Review [PRE_LAUNCH_CHECKLIST.md](../PRE_LAUNCH_CHECKLIST.md)
2. Complete all critical items
3. Test all user flows
4. Set up monitoring
5. Prepare for launch

## Getting Help

- Check the documentation in `/docs`
- Review error messages carefully
- Check Supabase logs
- Verify environment variables are set correctly

