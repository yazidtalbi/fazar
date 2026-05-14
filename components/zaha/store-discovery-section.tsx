import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Star, Heart, ChevronRight } from "lucide-react";
import { PopularStoresCarousel } from "./popular-stores-carousel";

export async function StoreDiscoverySection(): Promise<React.ReactElement> {
  const supabase = await createClient();

  // Get stores with city information
  const { data: stores } = await supabase
    .from("stores")
    .select(`
      id,
      name,
      slug,
      logo_url,
      city,
      created_at,
      products!inner(
        id,
        status,
        product_media(media_url, is_cover, order_index)
      )
    `)
    .eq("products.status", "active")
    .limit(50);

  // Filter stores with active products
  const storesWithProducts = (stores || []).filter((store: any) => {
    const activeProducts = (store.products || []).filter((p: any) => p.status === "active");
    return activeProducts.length > 0;
  });

  // Calculate store stats for all stores
  const storesWithStats = await Promise.all(
    storesWithProducts.map(async (store: any) => {
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", store.id)
        .eq("status", "active");

      const productIds = (products || []).map((p: any) => p.id);
      
      let rating = 0;
      let reviewCount = 0;
      
      if (productIds.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .in("product_id", productIds);

        const reviewsArray = reviews || [];
        reviewCount = reviewsArray.length;
        rating = reviewCount > 0
          ? reviewsArray.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
          : 0;
      }

      return {
        ...store,
        rating,
        reviewCount,
      };
    })
  );

  // Get unique cities
  const cities = Array.from(new Set(storesWithStats.map((s: any) => s.city).filter(Boolean))).slice(0, 5);
  const selectedCity = cities[0] || "Maroc";

  // Get popular stores with latest product image
  const popularStores = await Promise.all(
    storesWithStats.map(async (store: any) => {
      // Get the latest product for this store
      const { data: latestProduct } = await supabase
        .from("products")
        .select(`
          id,
          product_media(media_url, is_cover, order_index)
        `)
        .eq("store_id", store.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const latestProductImage = latestProduct?.product_media?.[0]?.media_url || null;

      return {
        ...store,
        productCount: (store.products || []).filter((p: any) => p.status === "active").length,
        latestProductImage,
      };
    })
  );

  // Sort by latest created date
  const sortedLatestStores = popularStores
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  return (
    <section className="hidden md:block bg-white py-12">
      <div className="max-w-[100rem] mx-auto px-12">
        {/* Latest Local Shops */}
        {sortedLatestStores.length > 0 && (
          <PopularStoresCarousel stores={sortedLatestStores} />
        )}
      </div>
    </section>
  );
}

