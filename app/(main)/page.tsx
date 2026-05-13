import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all data in parallel for better performance and to avoid the 'white page' delay
  const [
    { data: promotedProducts },
    { data: trendingProducts },
    { data: newProducts },
    { data: categories },
    { data: personalizedProductIds },
    { data: promotionProducts }
  ] = await Promise.all([
    supabase.from("products").select("*, product_media(media_url, media_type, order_index, is_cover), stores!inner(id, name, slug)").eq("status", "active").eq("is_promoted", true).order("created_at", { ascending: false }).limit(10),
    supabase.from("products").select("*, product_media(media_url, media_type, order_index, is_cover), stores!inner(id, name, slug)").eq("status", "active").eq("is_trending", true).order("created_at", { ascending: false }).limit(10),
    supabase.from("products").select("*, product_media(media_url, media_type, order_index, is_cover), stores!inner(id, name, slug)").eq("status", "active").order("created_at", { ascending: false }).limit(20),
    supabase.from("categories").select("id, name, slug").order("name").limit(10),
    supabase.from("product_personalizations").select("product_id").limit(1000),
    supabase.from("products").select("*, product_media(media_url, media_type, order_index, is_cover), stores!inner(id, name, slug)").eq("status", "active").not("promoted_price", "is", null).order("created_at", { ascending: false }).limit(10)
  ]);

  const productIdsWithPersonalization = personalizedProductIds 
    ? Array.from(new Set(personalizedProductIds.map((p: any) => p.product_id)))
    : [];

  // Fetch customized products if needed
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
      .in("id", productIdsWithPersonalization.slice(0, 10))
      .order("created_at", { ascending: false });
    
    customizedProducts = personalizedProductsData || [];
  }

  return (
    <>
      {/* Mobile: Promotional Banner Carousel */}
      <div className="md:hidden -mx-2 -mt-2 mb-0">
        <div className="h-64">
          <PromotionalBanner />
        </div>
      </div>

{/* Desktop Hero - Two Section Layout */}
<div className="hidden md:block relative w-full h-[500px] bg-background">
  <div className="max-w-[100rem] mx-auto px-12 py-4 h-full">
    <div className="grid md:grid-cols-3 gap-6 items-stretch h-full">
      {/* Left Section - Seller Promotional Banner (2/3 width) */}
      <div className="md:col-span-2 h-full">
        <SellerPromoBanner />
      </div>

      {/* Right Section - Hand Promotional Banner */}
      <div className="h-full">
        <div
          className="rounded-[32px] overflow-hidden h-full"
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
                sizes="(max-w-768px) 100vw, 33vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Browse by Category Section */}
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-2 md:py-8 md:pb-16">
        <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-[30px] text-left md:text-center">
          Browse by Category
        </h2>
        
        {/* Mobile: Horizontal Scroll with Images (same as desktop) */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {[
              { name: 'Rugs', slug: 'rugs-kilims', image: '/cat/22.png' },
              { name: 'Ceramics', slug: 'ceramics', image: '/cat/11.png' },
              { name: 'Leather', slug: 'leather', image: '/cat/33.png' },
              { name: 'Metalwork', slug: 'brass-metalwork', image: '/cat/44.png' },
              { name: 'Textiles', slug: 'textiles', image: '/cat/55.png' },
              { name: 'Home', slug: 'home-decor', image: '/cat/77.png' },
              { name: 'Jewelry', slug: 'jewelry', image: '/cat/66.png' },
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
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop: Horizontal Category Layout - 7 categories in viewport */}
        <div className="hidden md:flex items-center justify-between w-full max-w-auto xl:max-w-7/8 mx-auto gap-1">
          {[
            { name: 'Rugs', slug: 'rugs-kilims', image: '/cat/22.png' },
            { name: 'Ceramics', slug: 'ceramics', image: '/cat/11.png' },
            { name: 'Leather', slug: 'leather', image: '/cat/33.png' },
            { name: 'Metalwork', slug: 'brass-metalwork', image: '/cat/44.png' },
            { name: 'Textiles', slug: 'textiles', image: '/cat/55.png' },
            { name: 'Home', slug: 'home-decor', image: '/cat/77.png' },
            { name: 'Jewelry', slug: 'jewelry', image: '/cat/66.png' },
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
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-4 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-12">
          <h2 className="text-xl md:text-4xl font-bold">
            Discover the wonders from cities
          </h2>
          <Link href="/search" className="hidden md:block">
            <Button variant="ghost" className="text-sm">
              Voir tout
            </Button>
          </Link>
        </div>
        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-4">
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
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {[
            { cityName: "Meknès", imagePath: "/cities/meknes.png", href: "/search?city=meknes", backgroundColor: "#235C4B", textColor: "#FFFFFF" },
            { cityName: "Tétouan", imagePath: "/cities/tetouan.png", href: "/search?city=tetouan", backgroundColor: "#FEF8EC", textColor: "#000000" },
            { cityName: "Marrakech", imagePath: "/cities/marrakech.png", href: "/search?city=marrakech", backgroundColor: "#E75A3F", textColor: "#FFFFFF" },
            { cityName: "Rabat", imagePath: "/cities/rabat.png", href: "/search?city=rabat", backgroundColor: "#1B2E35", textColor: "#FFFFFF" },
            { cityName: "Fès", imagePath: "/cities/fes.png", href: "/search?city=fes", backgroundColor: "#2B1C28", textColor: "#FFFFFF" },
          ].map((city) => (
            <div key={city.cityName} className="flex-shrink-0 w-36">
              <CityCard 
                cityName={city.cityName} 
                imagePath={city.imagePath}
                href={city.href}
                backgroundColor={city.backgroundColor}
                textColor={city.textColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Promoted Items First */}
      {promotedProducts && promotedProducts.length > 0 && (
        <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-4 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Promoted Items</h2>
            <Link href="/search?sort=recommended">
              <Button variant="ghost" className="text-primary text-sm">
                View All
              </Button>
            </Link>
          </div>
          <MasonryGrid columns={{ mobile: 2 }}>
            {promotedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </MasonryGrid>
        </div>
      )}

      {/* Mobile: New Arrivals Section with Masonry Grid */}
      {newProducts && newProducts.length > 0 && (
        <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-4 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">New Arrivals</h2>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          <MasonryGrid columns={{ mobile: 2 }}>
            {newProducts.map((product: any) => (
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
    </>
  );
}
