import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/zaha/product-card";
import { Footer } from "@/components/zaha/footer";
import { ProjectExplanation } from "@/components/zaha/project-explanation";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  // Get promoted products (trending)
  const { data: promotedProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active")
    .eq("is_promoted", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get trending products
  const { data: trendingProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active")
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get recent products (new arrivals)
  const { data: newProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name")
    .limit(10);

  // Get categories with representative product images for desktop
  const categoriesWithImages = await Promise.all(
    ((categories || []).slice(0, 6)).map(async (category) => {
      const { data: products } = await supabase
        .from("products")
        .select(`
          id,
          product_media(media_url, media_type, order_index, is_cover)
        `)
        .eq("status", "active")
        .eq("category_id", category.id)
        .limit(1);
      
      const product = products?.[0];
      const mediaArray = (product?.product_media as any[]) || [];
      const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
      
      return {
        ...category,
        imageUrl: coverMedia?.media_url || null,
      };
    })
  );

  // Get products for "Gifts for the Soul" section (spiritual/relaxing items)
  // Using promoted or trending products as a fallback
  const giftsProducts = promotedProducts && promotedProducts.length > 0 
    ? promotedProducts.slice(0, 4) 
    : trendingProducts?.slice(0, 4) || [];

  // Get products for "Original Moroccan Gifts" carousel
  const giftBoxProducts = newProducts?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile: Original Layout, Desktop: Split Layout */}
      {/* Mobile Hero */}
      <div className="relative w-full h-64 md:hidden bg-gradient-to-r from-primary/20 to-background overflow-hidden">
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4">DISCOVER THE SOUL OF MOROCCO</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Hand-woven history in every knot. Explore our vintage collection.
            </p>
            <Link href="/search">
              <Button size="lg">SHOP NOW</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Hero - Split Layout */}
      <div className="hidden md:block relative w-full min-h-[600px] bg-background">
        <div className="grid md:grid-cols-2 gap-0 items-stretch">
          {/* Left Side - Text Content */}
          <div className="flex items-center px-8 lg:px-12 xl:px-16 py-20">
            <div className="space-y-6 max-w-lg">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">RAMADAN COLLECTION 2023</p>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                AUTHENTIC MOROCCAN<br />
                <span className="text-primary">CRAFTSMANSHIP</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover hand-woven rugs, intricate ceramics, and leather goods made by master artisans from Fez to Marrakech.
              </p>
              <Link href="/search">
                <Button size="lg" className="uppercase">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </div>
          {/* Right Side - Image */}
          <div className="relative w-full h-full min-h-[600px] bg-muted">
            {/* Placeholder for hero image - you can replace with actual image */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Hero Image
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Category Section */}
      {/* Mobile: Horizontal Scroll */}
      <div className="container mx-auto px-4 py-6 md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase">CATEGORIES</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories && categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Button variant="outline" className="whitespace-nowrap">
                {category.name.toUpperCase()}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:block container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold uppercase mb-12">Browse by Category</h2>
        <div className="grid grid-cols-3 gap-6">
          {categoriesWithImages.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square w-full bg-muted">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      {category.name}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-center">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: Trending Now Section */}
      {trendingProducts && trendingProducts.length > 0 && (
        <div className="container mx-auto px-4 py-6 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase">TRENDING NOW</h2>
            <Link href="/search?sort=recommended">
              <Button variant="ghost" className="text-primary">
                VIEW ALL
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile: New Arrivals Section */}
      {newProducts && newProducts.length > 0 && (
        <div className="container mx-auto px-4 py-6 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase">NEW ARRIVALS</h2>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {newProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Best of Winter 2025 Section */}
      {trendingProducts && trendingProducts.length > 0 && (
        <div className="hidden md:block container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold uppercase">Best of Winter 2025</h2>
            <Link href="/search?sort=recommended">
              <Button variant="ghost" className="text-sm uppercase">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Gifts for the Soul Section - Split Layout */}
      {giftsProducts.length > 0 && (
        <div className="hidden md:block bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Discover More</p>
                <h2 className="text-5xl font-bold">Gifts for the Soul</h2>
                <p className="text-lg text-muted-foreground">
                  Curated selections of spiritual and relaxing items, from Oud incense to hand-painted calligraphy.
                </p>
                <Link href="/search">
                  <Button variant="ghost" className="text-sm uppercase">
                    View More
                  </Button>
                </Link>
              </div>
              {/* Right Side - Image */}
              <div className="relative w-full h-[400px] bg-background border">
                {/* Placeholder for gifts image */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Gifts Image
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Original Moroccan Gifts Section - Carousel */}
      {giftBoxProducts.length > 0 && (
        <div className="hidden md:block container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold uppercase">Original Moroccan Gifts</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {giftBoxProducts.map((product: any) => {
              const mediaArray = Array.isArray(product.product_media) ? product.product_media : [];
              const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
              return (
                <div key={product.id} className="flex-shrink-0 w-64">
                  <Card className="overflow-hidden">
                    <div className="relative aspect-square w-full bg-muted">
                      {coverMedia?.media_url ? (
                        <Image
                          src={coverMedia.media_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="256px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {product.title}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: Project Explanation Section */}
      <div className="hidden md:block">
        <ProjectExplanation />
      </div>

      {/* Desktop: Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
