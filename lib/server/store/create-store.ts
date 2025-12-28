import { createClient } from "@/lib/supabase/server";
import { slugify, generateUniqueSlug } from "@/lib/utils/slug";

export async function createStore(
  sellerId: string,
  storeName: string
): Promise<{ storeId: string; slug: string } | { error: string }> {
  const supabase = await createClient();

  // Check if store already exists
  const { data: existingStore } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", sellerId)
    .single();

  if (existingStore) {
    return { error: "Store already exists for this seller" };
  }

  // Generate unique slug
  const baseSlug = slugify(storeName);
  const slug = await generateUniqueSlug(baseSlug, async (slugToCheck: string) => {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slugToCheck)
      .single();
    return !!data;
  });

  // Create store
  const { data: store, error } = await supabase
    .from("stores")
    .insert({
      seller_id: sellerId,
      name: storeName,
      slug,
    })
    .select("id, slug")
    .single();

  if (error || !store) {
    return { error: error?.message || "Failed to create store" };
  }

  return { storeId: store.id, slug: store.slug };
}

