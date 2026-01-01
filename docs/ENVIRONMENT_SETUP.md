# Environment Variables Setup Guide

This document explains how to set up environment variables for the Afus marketplace application.

## Required Environment Variables

### Development (.env.local)

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Production (Vercel/Deployment Platform)

Set these same variables in your deployment platform's environment variables settings.

## How to Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**: https://app.supabase.com
2. **Navigate to Settings → API**
3. **Copy the following values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Security Best Practices

### ⚠️ CRITICAL: Service Role Key Security

- **NEVER** commit the service role key to version control
- **NEVER** expose the service role key to the client-side
- **ONLY** use the service role key in server-side code (API routes, Server Components)
- The service role key bypasses Row Level Security (RLS) - use with caution

### Environment Variable Naming

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-only
- Always use `.env.local` for local development (it's in `.gitignore`)

## Verification

Run the setup verification script to check your configuration:

```bash
npm run verify-setup
# or
npx tsx scripts/verify-setup.ts
```

## Troubleshooting

### "Missing environment variable" error

- Ensure `.env.local` exists in the root directory
- Check that variable names match exactly (case-sensitive)
- Restart your development server after adding/changing variables

### "Invalid URL format" error

- Ensure `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Example: `https://xxxxxxxxxxxxx.supabase.co`

### "Key appears to be invalid" error

- Verify you copied the entire key (they're very long)
- Check for any extra spaces or line breaks
- Re-copy from Supabase dashboard if needed

### Service role key not working

- Ensure you're using it only in server-side code
- Check that the key hasn't been rotated in Supabase
- Verify the key has the correct permissions

## Production Deployment

### Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Select the appropriate environments (Production, Preview, Development)
5. Redeploy your application

### Other Platforms

Follow your platform's documentation for setting environment variables. The process is similar:
1. Find the environment variables section in your platform's dashboard
2. Add the three required variables
3. Ensure they're available in your production environment
4. Redeploy

## Testing Your Setup

After setting up environment variables, test the connection:

```bash
# Run the verification script
npm run verify-setup

# Or test manually in your code
# In a Server Component or API route:
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
const { data } = await supabase.from("categories").select("*");
console.log(data); // Should return categories
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

