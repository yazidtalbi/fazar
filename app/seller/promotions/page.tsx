import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PromotionsClient } from "@/components/seller/promotions-client";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get store
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  // Get promoted products
  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      currency,
      is_promoted,
      promoted_start_date,
      promoted_end_date,
      product_media!inner(media_url, is_cover, order_index)
    `)
    .eq("store_id", store.id)
    .eq("is_promoted", true)
    .order("promoted_start_date", { ascending: false });

  const productsWithCover = (products || []).map((product: any) => {
    const media = product.product_media as Array<{
      media_url: string;
      is_cover: boolean;
      order_index: number;
    }>;
    const coverMedia = media.find((m) => m.is_cover) || media[0];
    return {
      ...product,
      cover_media: coverMedia?.media_url || null,
    };
  });

  // Get promotion pricing
  const { data: pricing } = await supabase
    .from("promotion_pricing")
    .select("price_per_day, min_days, max_days")
    .eq("is_active", true)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <h1 className="text-3xl font-bold mb-6">Promotions Management</h1>
        <PromotionsClient 
          products={productsWithCover} 
          pricing={pricing || { price_per_day: 10, min_days: 1, max_days: 30 }}
        />
      </div>
    </div>
  );
}

