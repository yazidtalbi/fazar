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

  // Sort by product count and don't limit
  const sortedPopularStores = popularStores
    .sort((a, b) => b.productCount - a.productCount);

  // Get new stores (recently created)
  const newStores = storesWithStats
    .map((store: any) => ({
      ...store,
      firstProductImage: (() => {
        const activeProducts = (store.products || []).filter((p: any) => p.status === "active");
        const firstProduct = activeProducts[0];
        const mediaArray = firstProduct?.product_media || [];
        const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
        return coverMedia?.media_url || null;
      })(),
      monthsOnAfus: Math.floor((Date.now() - new Date(store.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  // Get stores by city
  const cityStores = storesWithStats
    .filter((store: any) => store.city === selectedCity)
    .slice(0, 20);

  return (
    <section className="hidden md:block bg-white py-12">
      <div className="max-w-[100rem] mx-auto px-12">
        {/* Popular Local Shops */}
        {sortedPopularStores.length > 0 && (
          <PopularStoresCarousel stores={sortedPopularStores} />
        )}

        {/* All Local Shops */}
        {cityStores.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-2 text-neutral-900">
              Toutes les boutiques locales
            </h3>
            <p className="text-base text-neutral-600 mb-6">
              Vous cherchez un article en particulier ? Indiquez votre requête puis filtrez les résultats par « Pays d&apos;expédition ».{" "}
              <Link href="/search" className="underline hover:text-primary">
                En savoir plus
              </Link>
            </p>
            <div className="grid grid-cols-2 gap-4">
              {cityStores.slice(0, 12).map((store: any) => (
                <Link
                  key={store.id}
                  href={`/store/${store.slug}`}
                >
                  <Card className="overflow-hidden hover:border-primary/30 transition-colors border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      {store.logo_url ? (
                        <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0 border-2 border-white">
                          <Image
                            src={store.logo_url}
                            alt={store.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold flex-shrink-0">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-1 truncate">{store.name}</h4>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{store.rating > 0 ? store.rating.toFixed(1) : '0.0'}</span>
                          <span className="text-sm text-muted-foreground">({store.reviewCount})</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">Maison et déco</p>
                      </div>
                        <div className="flex-shrink-0 text-muted-foreground">
                          <Heart className="h-5 w-5" />
                        </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

