import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/zaha/product-card";
import { Footer } from "@/components/zaha/footer";
import { ProjectExplanation } from "@/components/zaha/project-explanation";
import { StoreDiscoverySection } from "@/components/zaha/store-discovery-section";
import { CarouselNavButton } from "@/components/zaha/carousel-nav-button";
import { PromotionalBanner } from "@/components/zaha/promotional-banner";
import { SellerPromoBanner } from "@/components/zaha/seller-promo-banner";
import { MasonryGrid } from "@/components/zaha/masonry-grid";
import { ProductCarousel } from "@/components/zaha/product-carousel";
import { CityCard } from "@/components/zaha/city-card";
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

  // Get products with personalization options
  // First get product IDs that have personalizations
  const { data: personalizedProductIds } = await supabase
    .from("product_personalizations")
    .select("product_id")
    .limit(1000);

  const productIdsWithPersonalization = personalizedProductIds 
    ? Array.from(new Set(personalizedProductIds.map((p: any) => p.product_id)))
    : [];

  // Then fetch those products with their media
  let customizedProducts: any[] = [];
  if (productIdsWithPersonalization.length > 0) {
    const { data: personalizedProductsData } = await supabase
      .from("products")
      .select(`
        *,
        product_media(media_url, media_type, order_index, is_cover),
        stores!inner(id, name, slug)
      `)
      .eq("status", "active")
      .in("id", productIdsWithPersonalization)
      .order("created_at", { ascending: false })
      .limit(10);
    
    customizedProducts = personalizedProductsData || [];
  }

  // Get products on promotion (with promoted_price)
  const { data: promotionProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active")
    .not("promoted_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile: Original Layout, Desktop: Split Layout */}
      {/* Mobile Hero */}
      <div className="relative w-full h-64 md:hidden bg-gradient-to-r from-accent/30 via-muted to-background overflow-hidden rounded-b-3xl">
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
    <div className="grid md:grid-cols-3 gap-6 items-stretch">
      {/* Left Section - Seller Promotional Banner (2/3 width) */}
      <div className="md:col-span-2 h-full">
        <SellerPromoBanner />
      </div>

{/* Right Section - Hand Promotional Banner */}
<div className="h-full">
  <div
    className="rounded-3xl overflow-hidden h-full"
    style={{ background: "linear-gradient(to bottom, #fef8ec, #f4e9fa)" }}
  >
    <div className="relative flex flex-col h-full pt-10 px-10">
      {/* Text */}
      <p className="text-2xl md:text-3xl font-semibold text-right text-[#673399]">
        Download the <br /> mobile App now
      </p>

      {/* Image wrapper takes remaining height */}
      <div className="relative flex-1 flex items-end justify-end">
        <Image
          src="/landing/hands.png"
          alt="Hand"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  </div>
</div>

    </div>
  </div>
</div>


      {/* Browse by Category Section */}
      <div className="max-w-[100rem] mx-auto px-12 py-6 md:py-8 md:pb-16">
        <h2 className="text-3xl font-bold mb-[30px] text-center">
          Browse by Category
        </h2>
        
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden">
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

        {/* Desktop: Horizontal Category Layout - 7 categories in viewport */}
        <div className="hidden md:flex items-center justify-between w-full max-w-auto xl:max-w-7/8 mx-auto gap-1">
          {/* Fixed list of categories that match available images */}
          {[
            { name: 'Jewelry', slug: 'jewelry', image: '/cat/22.png' },
            { name: 'Art', slug: 'art', image: '/cat/11.png' },
            { name: 'Beauty', slug: 'beauty', image: '/cat/33.png' },
            { name: 'Clothing', slug: 'clothing', image: '/cat/44.png' },
            { name: 'Bags', slug: 'bags', image: '/cat/55.png' },
            { name: 'Home Living', slug: 'home-living', image: '/cat/77.png' },
            { name: 'Baby', slug: 'baby', image: '/cat/66.png' },
          ].map((cat) => {
            // Try to find matching category in database, otherwise use provided slug
            const dbCategory = categories?.find(c => 
              c.name.toLowerCase() === cat.name.toLowerCase() || 
              c.slug === cat.slug
            );
            const categorySlug = dbCategory?.slug || cat.slug;
            
            return (
              <Link 
                key={cat.slug} 
                href={`/categories/${categorySlug}`}
                className="flex flex-col items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity flex-1"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={112}
                    height={112}
                    className="object-contain w-full h-full"
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground text-center whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* City Cards Section */}
      <div className="max-w-[100rem] mx-auto px-12 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-12">
          <h2 className="text-xl md:text-4xl font-bold">
            Discover the wonders from cities
          </h2>
          <Link href="/search">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <CityCard 
            cityName="Meknès" 
            imagePath="/cities/meknes.png"
            href="/search?city=meknes"
            backgroundColor="#235C4B"
            textColor="#FFFFFF"
          />
          <CityCard 
            cityName="Tétouan" 
            imagePath="/cities/tetouan.png"
            href="/search?city=tetouan"
            backgroundColor="#FEF8EC"
            textColor="#000000"
          />
          <CityCard 
            cityName="Marrakech" 
            imagePath="/cities/marrakech.png"
            href="/search?city=marrakech"
            backgroundColor="#E75A3F"
            textColor="#FFFFFF"
          />
          <CityCard 
            cityName="Rabat" 
            imagePath="/cities/rabat.png"
            href="/search?city=rabat"
            backgroundColor="#1B2E35"
            textColor="#FFFFFF"
          />
          <CityCard 
            cityName="Fès" 
            imagePath="/cities/fes.png"
            href="/search?city=fes"
            backgroundColor="#2B1C28"
            textColor="#FFFFFF"
          />
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

      {/* Mobile: New Arrivals Section with Masonry Grid */}
      {newProducts && newProducts.length > 0 && (
        <div className="max-w-[100rem] mx-auto px-12 py-6 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase">NEW ARRIVALS</h2>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          <MasonryGrid columns={{ mobile: 2 }}>
            {newProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </MasonryGrid>
        </div>
      )}


      {/* Desktop: Promoted Articles Section */}
      {promotedProducts && promotedProducts.length > 0 && (
        <ProductCarousel
          title="Articles en vedette"
          products={promotedProducts}
          viewAllHref="/search?sort=recommended"
        />
      )}

      {/* Desktop: Newest Rail */}
      {newProducts && newProducts.length > 0 && (
        <ProductCarousel
          title="Nouveautés"
          products={newProducts}
          viewAllHref="/search?sort=newest"
        />
      )}

      {/* Desktop: Promotion Items Section - Hidden for now */}
      {/* {promotionProducts && promotionProducts.length > 0 && (
        <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#222222]">Promotion</h2>
            <Link href="/search?category=sale">
              <Button variant="ghost" className="text-sm">
                Voir tout
              </Button>
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {promotionProducts.slice(0, 10).map((product: any) => (
              <div key={product.id} className="flex-shrink-0 w-64">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Desktop: Customized Name Items Rail - Hidden for now */}
      {/* <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-16">
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
            <div key={product.id} className="flex-shrink-0 w-64">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div> */}


      {/* Desktop: Store Discovery Section */}
      <div className="hidden md:block">
        <StoreDiscoverySection />
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
