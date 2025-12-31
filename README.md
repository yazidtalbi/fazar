# Andalus - Authentic Moroccan Craft Marketplace

A mobile-first Etsy-like marketplace for Morocco with an editorial, heritage-inspired UI.

## Tech Stack

- **Next.js 16** (App Router)
- **React Server Components** (RSC)
- **TypeScript**
- **Supabase** (Auth, Database, Storage)
- **Tailwind CSS** (Custom theme with sharp edges, no rounded corners)
- **shadcn/ui** + **Radix UI**
- **nuqs** (URL state management)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Run database migrations:
   - Apply the SQL migrations in `supabase/migrations/` to your Supabase database
   - Run them in order: `001_initial_schema.sql`, `002_row_level_security.sql`, `003_initial_categories.sql`

4. Set up Supabase Storage:
   - Create a bucket called `product-media` (or update the code to use your preferred bucket name)
   - Configure storage policies for public read access to product media

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
/app              # Next.js App Router pages
  /auth           # Authentication pages (login, register)
  /onboarding     # User onboarding flows
  /app            # Buyer app routes
  /seller         # Seller app routes
  /p              # Product detail pages
  /store          # Public store pages

/components       # React components
  /ui             # shadcn/ui base components
  /zaha           # Domain-specific components

/lib
  /server         # Server-only code (RSC, Server Actions)
    /account      # Account context loading
    /store        # Store-related server functions
  /supabase       # Supabase client utilities
  /utils          # Shared utilities

/supabase/migrations  # Database migration files
```

## Key Features

- **Dual Profiles**: Every user has both buyer_profile and seller_profile
- **Store System**: Each seller has exactly one store with a unique slug
- **Product Management**: Products support images + optional video, trending/promoted flags, made-to-order with days_to_craft
- **Contact System**: Store pages feature contact buttons with WhatsApp/Instagram/Facebook links
- **Cash on Delivery**: Checkout is COD-only
- **Account Context**: Loaded once at layout level, reused across app
- **Masonry Grid**: Product listings use CSS columns for masonry layout
- **Sharp Edges Design**: No rounded corners, framed layouts, Moroccan-inspired palette

## Design Principles

- Mobile-first UX
- Sharp edges (no border-radius)
- Sand/parchment backgrounds + brown/charcoal typography
- Typography-first layouts
- Framed sections with borders

## Database Schema

Key tables:
- `buyer_profiles` (1:1 with auth.users)
- `seller_profiles` (1:1 with auth.users, includes is_verified)
- `stores` (1:1 with seller_profiles, unique slug)
- `products` (with promoted, trending, days_to_craft)
- `product_media` (images + video)
- `orders` (COD only)
- `cart_items`

## Development Notes

- All routes under `/app` and `/seller` require authentication (handled by middleware)
- Public routes: `/`, `/search`, `/p/[id]`, `/store/[slug]`
- Server Components by default; use "use client" sparingly
- Use Server Actions for mutations
- Account context is loaded at `/app/layout` and `/seller/layout`
