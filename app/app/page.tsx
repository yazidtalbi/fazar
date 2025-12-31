import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/zaha/product-card";
import { Footer } from "@/components/zaha/footer";
import { ProjectExplanation } from "@/components/zaha/project-explanation";
import { CarouselNavButton } from "@/components/zaha/carousel-nav-button";
import { PromotionalBanner } from "@/components/zaha/promotional-banner";
import { ProductAdBanner } from "@/components/zaha/product-ad-banner";
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

  // Get products by cities (mock - in real app, filter by store location)
  const cityProducts = newProducts?.slice(0, 5) || [];

  // Get customized name items (products with personalization)
  const customizedProducts = newProducts?.slice(0, 5) || [];

  // Get "For her" gifts (products in gift/fashion categories)
  const forHerProducts = newProducts?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile: Original Layout, Desktop: Split Layout */}
      {/* Mobile Hero */}
      <div className="relative w-full h-64 md:hidden bg-gradient-to-r from-primary/20 to-background overflow-hidden">
        <div className="relative max-w-[100rem] mx-auto px-12 h-full flex items-center">
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

      {/* Desktop Hero - Two Section Layout */}
      <div className="hidden md:block relative w-full min-h-[500px] bg-background">
        <div className="max-w-[100rem] mx-auto px-12 py-8">
          <div className="grid md:grid-cols-3 gap-6 h-[500px]">
            {/* Left Section - Promotional Carousel (2/3 width) */}
            <div className="md:col-span-2 h-full">
              <PromotionalBanner />
            </div>
            
            {/* Right Section - Product Advertisement (1/3 width) */}
            <div className="h-full">
              <ProductAdBanner />
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Category Section */}
      {/* Mobile: Horizontal Scroll */}
      <div className="max-w-[100rem] mx-auto px-12 py-6 md:hidden">
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
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
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
        <div className="max-w-[100rem] mx-auto px-12 py-6 md:hidden">
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
        <div className="max-w-[100rem] mx-auto px-12 py-6 md:hidden">
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

      {/* Desktop: Todays Best Deals For You! Section */}
      {promotedProducts && promotedProducts.length > 0 && (
        <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-[#222222]">Todays Best Deals For You!</h2>
            <Link href="/search?sort=recommended">
              <span className="text-sm text-primary hover:underline cursor-pointer">View All &gt;</span>
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {promotedProducts.slice(0, 5).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Discount Section (60% Off Or More) */}
      {trendingProducts && trendingProducts.length > 0 && (
        <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-[#222222]">60% Off Or More On Winter-Wear</h2>
            <Link href="/search?category=winter">
              <span className="text-sm text-primary hover:underline cursor-pointer">View All &gt;</span>
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {trendingProducts.slice(0, 5).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Gifts for the Soul Section - Split Layout */}
      {giftsProducts.length > 0 && (
        <div className="hidden md:block bg-muted py-16">
          <div className="max-w-[100rem] mx-auto px-12">
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

      {/* Desktop: Category Rails - Gift Categories */}
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
        <h2 className="text-3xl font-bold mb-8 text-[#222222]">
          Des cadeaux aussi extraordinaires que leur destinataire
        </h2>
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {[
              { title: "Cadeaux bien-être", image: "🧘", products: giftsProducts },
              { title: "Cadeaux douillets", image: "🛏️", products: giftBoxProducts },
              { title: "Cadeaux pour crémaillère", image: "🏠", products: cityProducts },
              { title: "Cadeaux pour bébés", image: "👶", products: customizedProducts },
              { title: "Cadeaux pour lui", image: "🎁", products: forHerProducts },
            ].map((category, idx) => (
              <Link key={idx} href={`/search?category=${category.title}`} className="flex-shrink-0 w-80 group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    {category.products[0] ? (
                      (() => {
                        const mediaArray = Array.isArray(category.products[0].product_media) 
                          ? category.products[0].product_media 
                          : [];
                        const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
                        return coverMedia?.media_url ? (
                          <Image
                            src={coverMedia.media_url}
                            alt={category.title}
                            fill
                            className="object-cover"
                            sizes="320px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                            {category.image}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                        {category.image}
                      </div>
                    )}
                    {/* Search overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#222222]">
                        <Search className="h-4 w-4" />
                        <span>{category.title}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <CarouselNavButton />
        </div>
      </div>

      {/* Desktop: Cities Rail */}
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#222222]">Par ville</h2>
          <Link href="/search?sort=newest">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {cityProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Desktop: Customized Name Items Rail */}
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#222222]">Articles personnalisés</h2>
          <Link href="/search?category=personalized">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {customizedProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Desktop: Newest Rail */}
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#222222]">Nouveautés</h2>
          <Link href="/search?sort=newest">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {newProducts?.slice(0, 10).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Desktop: For Her Gifts Rail */}
      <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#222222]">Cadeaux pour elle</h2>
          <Link href="/search?category=for-her">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {forHerProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

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
