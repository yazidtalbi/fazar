import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorePageTabs } from "@/components/zaha/store-page-tabs";
import { StoreContactSheet } from "@/components/zaha/store-contact-sheet";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { ArrowLeft, Search, Share2, MapPin, ShoppingCart, Star, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/zaha/product-card";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select(`
      *,
      seller_profiles(is_verified)
    `)
    .eq("slug", slug)
    .single();

  if (error || !store) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      currency,
      status,
      is_promoted,
      is_trending,
      days_to_craft,
      product_media(media_url, media_type, order_index, is_cover)
    `)
    .eq("store_id", store.id)
    .eq("status", "active")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false });

  // Get cover media for products
  const productsWithCover = (products || []).map((product) => {
    const media = product.product_media as Array<{
      media_url: string;
      media_type: string;
      order_index: number;
      is_cover: boolean;
    }>;
    const coverMedia = media.find((m) => m.is_cover) || media[0];
    return {
      ...product,
      cover_media: coverMedia?.media_url || null,
    };
  });

  const sellerProfile = store.seller_profiles as { is_verified: boolean } | null;
  const salesCount = productsWithCover.length > 0 ? (productsWithCover.length * 100).toLocaleString() : "0";
  const rating = 4.9;
  const reviewCount = 128;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header */}
      <div className="hidden md:block h-[97px]"></div>

      {/* Breadcrumbs */}
      <div className="hidden md:block border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/app" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{store.name}</span>
          </div>
        </div>
      </div>

      {/* Store Banner - Desktop */}
      {store.cover_url && (
        <div className="hidden md:block relative h-64 w-full bg-muted">
          <Image
            src={store.cover_url}
            alt={store.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 bg-white">
        {/* Store Header Section - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Store Logo */}
            <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{store.name}</h1>
                {sellerProfile?.is_verified && (
                  <Badge variant="outline" className="text-xs">Verified</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{salesCount} sales</span>
                <span className="text-sm text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Morocco</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Follow
                </Button>
                <StoreContactSheet store={store}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </StoreContactSheet>
              </div>
            </div>
          </div>

          {/* Store Description */}
          {store.description && (
            <div className="mb-8">
              <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">{store.description}</p>
            </div>
          )}
        </div>

        {/* Mobile Store Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{store.name}</h1>
                {sellerProfile?.is_verified && (
                  <Badge variant="outline" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span>{rating.toFixed(1)}</span>
                <span>•</span>
                <span>{salesCount} sales</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Follow
                </Button>
                <StoreContactSheet store={store}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Message
                  </Button>
                </StoreContactSheet>
              </div>
            </div>
          </div>
          {store.description && (
            <p className="text-sm text-muted-foreground mb-4">{store.description}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Shop</h2>
            <span className="text-sm text-muted-foreground">{productsWithCover.length} items</span>
          </div>
          
          {productsWithCover.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsWithCover.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* About Section */}
        {store.description && (
          <div className="border-t pt-8 mb-12">
            <h3 className="text-xl font-semibold mb-4">About this shop</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line max-w-3xl">
              {store.description}
            </p>
          </div>
        )}

        {/* Reviews Section - Desktop */}
        <div className="hidden md:block border-t pt-8 mb-12">
          <h3 className="text-xl font-semibold mb-6">Reviews</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{rating.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>No reviews yet. Be the first to leave a review!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Contact Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4">
        <StoreContactSheet store={store}>
          <Button className="w-full" size="lg">
            CONTACT SELLER
          </Button>
        </StoreContactSheet>
      </div>
    </div>
  );
}

