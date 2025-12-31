import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreCustomization } from "@/components/seller/store-customization";

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  // Get products for featured items
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, is_featured")
    .eq("store_id", store.id)
    .order("title", { ascending: true });

  // Get collections with their products
  const { data: collections } = await supabase
    .from("collections")
    .select(`
      id,
      name,
      description,
      order_index,
      collection_products(
        product_id,
        products(id, title, price)
      )
    `)
    .eq("store_id", store.id)
    .order("order_index", { ascending: true });

  // Transform collections to match expected type (products is returned as array from Supabase)
  const transformedCollections = (collections || []).map(collection => ({
    ...collection,
    collection_products: (collection.collection_products || []).map((cp: any) => ({
      product_id: cp.product_id,
      products: Array.isArray(cp.products) ? cp.products[0] : cp.products,
    })),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Customize Store</h1>
        <StoreCustomization
          store={store}
          products={products || []}
          collections={transformedCollections}
        />
      </div>
    </div>
  );
}

