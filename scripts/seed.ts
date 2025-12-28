import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Create a test user
    const email = `test+${Date.now()}@example.com`;
    const password = "test123456";

    console.log(`📧 Creating user: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log(`✅ User created: ${userId}\n`);

    // Create buyer profile
    console.log("👤 Creating buyer profile...");
    const { error: buyerError } = await supabase
      .from("buyer_profiles")
      .insert({ id: userId });

    if (buyerError) {
      throw new Error(`Failed to create buyer profile: ${buyerError.message}`);
    }
    console.log("✅ Buyer profile created\n");

    // Create seller profile
    console.log("🏪 Creating seller profile...");
    const { error: sellerError } = await supabase
      .from("seller_profiles")
      .insert({ id: userId, is_verified: true });

    if (sellerError) {
      throw new Error(`Failed to create seller profile: ${sellerError.message}`);
    }
    console.log("✅ Seller profile created\n");

    // Get a category for products
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .limit(1)
      .single();

    if (!categories) {
      throw new Error("No categories found. Please run migrations first.");
    }

    // Create a store
    console.log("🏬 Creating store...");
    const storeName = "Fez Artisan Workshop";
    const storeSlug = `fez-artisan-${Date.now()}`;

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        seller_id: userId,
        name: storeName,
        slug: storeSlug,
        description: "Handcrafted treasures from the ancient city of Fez. Specializing in traditional ceramics, leatherwork, and brassware made by master artisans.",
        phone: "+212 6 12 34 56 78",
        email: email,
        whatsapp: "212612345678",
        instagram: "fezartisan",
        facebook: "fezartisanworkshop",
      })
      .select()
      .single();

    if (storeError) {
      throw new Error(`Failed to create store: ${storeError.message}`);
    }
    console.log(`✅ Store created: ${store.name} (${store.slug})\n`);

    // Create products
    console.log("📦 Creating products...");

    const products = [
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Beni Ourain Wool Rug",
        description: "Hand-knotted in the Middle Atlas mountains using 100% natural live sheep's wool. This Beni Ourain rug features the classic diamond lattice design in charcoal against a creamy ivory background.",
        price: 2400,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 5,
        days_to_craft: 14,
        is_promoted: false,
        is_trending: true,
        status: "active" as const,
      },
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Azilal Geometric Carpet",
        description: "Colorful Azilal rug with traditional geometric patterns in vibrant colors.",
        price: 1800,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 3,
        days_to_craft: 21,
        is_promoted: true,
        is_trending: false,
        status: "active" as const,
      },
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Kilim Pillow Case",
        description: "Handwoven kilim pillow case in rich red with orange accents.",
        price: 450,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 10,
        days_to_craft: 7,
        is_promoted: false,
        is_trending: false,
        status: "active" as const,
      },
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Leather Pouf Tan",
        description: "Handcrafted leather pouf with decorative stitching.",
        price: 600,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 8,
        days_to_craft: 10,
        is_promoted: false,
        is_trending: true,
        status: "active" as const,
      },
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Brass Table Lantern",
        description: "Ornate brass lantern with intricate cut-out patterns.",
        price: 350,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 12,
        days_to_craft: 5,
        is_promoted: false,
        is_trending: false,
        status: "active" as const,
      },
      {
        store_id: store.id,
        category_id: categories.id,
        title: "Ceramic Bowl Set",
        description: "Set of handcrafted ceramic bowls in varying sizes and colors.",
        price: 280,
        currency: "MAD",
        condition: "new" as const,
        stock_quantity: 15,
        days_to_craft: 0,
        is_promoted: false,
        is_trending: false,
        status: "active" as const,
      },
    ];

    const { data: createdProducts, error: productsError } = await supabase
      .from("products")
      .insert(products)
      .select();

    if (productsError) {
      throw new Error(`Failed to create products: ${productsError.message}`);
    }

    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Add placeholder media for products
    console.log("📸 Adding product media...");
    const placeholderImageUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800"; // Generic placeholder
    const mediaEntries = createdProducts.flatMap((product) => ({
      product_id: product.id,
      media_url: placeholderImageUrl,
      media_type: "image" as const,
      mime_type: "image/jpeg",
      order_index: 0,
      is_cover: true,
    }));

    const { error: mediaError } = await supabase
      .from("product_media")
      .insert(mediaEntries);

    if (mediaError) {
      console.warn(`⚠️  Warning: Failed to add product media: ${mediaError.message}`);
    } else {
      console.log(`✅ Added media for ${createdProducts.length} products\n`);
    }

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ Seed completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🏪 Store: ${store.name}`);
    console.log(`🔗 Store Slug: ${store.slug}`);
    console.log(`📦 Products: ${createdProducts.length}`);
    console.log("\nYou can now log in with the credentials above.\n");
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  }
}

seed();

