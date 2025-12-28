import { createClient } from "@/lib/supabase/server";
import type { AccountContext } from "./types";

export async function loadAccountContext(userId: string): Promise<AccountContext | null> {
  const supabase = await createClient();

  // Load user
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user.user || user.user.id !== userId) {
    return null;
  }

  // Load buyer profile
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // Load seller profile with store and products
  const { data: sellerProfileData } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  let sellerProfileWithStore = null;
  if (sellerProfileData) {
    const { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("seller_id", userId)
      .single();

    if (store) {
      // Load lightweight product list for the store
      const { data: products } = await supabase
        .from("products")
        .select(`
          id,
          title,
          price,
          status,
          is_promoted,
          is_trending,
          days_to_craft
        `)
        .eq("store_id", store.id);

      // Get cover media for products
      const productIds = products?.map((p) => p.id) || [];
      const { data: media } = productIds.length > 0
        ? await supabase
            .from("product_media")
            .select("product_id, media_url, is_cover, order_index")
            .in("product_id", productIds)
            .order("order_index")
        : { data: null };

      const productsWithCover = (products || []).map((product) => {
        const productMedia = media?.find(
          (m) => m.product_id === product.id && m.is_cover
        ) || media?.find((m) => m.product_id === product.id);
        return {
          ...product,
          cover_media: productMedia?.media_url || null,
        };
      });

      sellerProfileWithStore = {
        ...sellerProfileData,
        store: {
          ...store,
          products: productsWithCover,
        },
      };
    } else {
      sellerProfileWithStore = {
        ...sellerProfileData,
        store: null,
      };
    }
  }

  return {
    user: {
      id: user.user.id,
      email: user.user.email,
    },
    buyerProfile: buyerProfile || null,
    sellerProfile: sellerProfileWithStore,
  };
}

