import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailCarousel } from "@/components/zaha/product-detail-carousel";
import { ProductCollapsibleSection } from "@/components/zaha/product-collapsible-section";
import { AddToCartWithQuantity } from "@/components/zaha/add-to-cart-with-quantity";
import { EstimatedReadyDate } from "@/components/zaha/estimated-ready-date";
import { ProductStickyHeader } from "@/components/zaha/product-sticky-header";
import { Bookmark, MapPin, ArrowRight, Star } from "lucide-react";
import { ProductCard } from "@/components/zaha/product-card";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      product_media(*),
      stores!inner(
        id,
        name,
        slug,
        seller_profiles(
          id,
          is_verified
        )
      ),
      categories(id, name, slug)
    `)
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (productError || !product) {
    notFound();
  }

  // Get more products from the same artisan/store
  const { data: moreProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("store_id", product.stores.id)
    .eq("status", "active")
    .neq("id", product.id)
    .limit(10);

  // Get cover media for more products
  const moreProductsWithCover = (moreProducts || []).map((p: any) => {
    const media = p.product_media as Array<{
      media_url: string;
      media_type: string;
      order_index: number;
      is_cover: boolean;
    }>;
    const coverMedia = media.find((m) => m.is_cover) || media[0];
    return {
      ...p,
      cover_media: coverMedia?.media_url || null,
    };
  });

  const store = product.stores as any;
  const sellerProfile = store.seller_profiles as any;
  const media = (product.product_media || []) as Array<{
    media_url: string;
    media_type: string;
    order_index: number;
  }>;

  // Mock reviews data - in real app, fetch from reviews table
  const reviewCount = 42;
  const rating = 4.9;

  const coverMedia = media[0]?.media_url || null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Sticky Header */}
      <ProductStickyHeader title={product.title} imageUrl={coverMedia} productId={product.id} />
      
      {/* Product Image Carousel */}
      <ProductDetailCarousel media={media} />

      {/* Product Details */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Title with Bookmark */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold flex-1">{product.title}</h1>
          <Button variant="ghost" size="icon">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{Number(product.price).toLocaleString()} {product.currency || "MAD"}</span>
        </div>

        {/* Reviews */}
        <div className="flex items-center gap-2">
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

        {/* Artisan Information Card */}
        <Card className="border">
          <CardContent className="p-4">
            <Link href={`/store/${store.slug}`} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Artisan: {store.name}</span>
                  {sellerProfile?.is_verified && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">Marrakech, Morocco</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
            </Link>
          </CardContent>
        </Card>

        {/* Days to Craft Badge */}
        {product.days_to_craft > 0 && (
          <div>
            <EstimatedReadyDate daysToCraft={product.days_to_craft} />
          </div>
        )}

        {/* Promoted/Trending Badges */}
        <div className="flex gap-2">
          {product.is_promoted && (
            <Badge variant="default">Promoted</Badge>
          )}
          {product.is_trending && (
            <Badge variant="secondary">Trending</Badge>
          )}
        </div>

        {/* Description (Collapsible) */}
        <ProductCollapsibleSection title="Description" defaultOpen={true}>
          {product.description || "No description available."}
        </ProductCollapsibleSection>

        {/* Specifications (Collapsible) */}
        <ProductCollapsibleSection title="Specifications">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Condition:</span>
              <span>{product.condition || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Category:</span>
              <span>{(product.categories as any)?.name || "Uncategorized"}</span>
            </div>
            {product.days_to_craft > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Days to craft:</span>
                <span>{product.days_to_craft} days</span>
              </div>
            )}
          </div>
        </ProductCollapsibleSection>

        {/* Shipping & Returns (Collapsible) */}
        <ProductCollapsibleSection title="Shipping & Returns">
          <div className="space-y-3">
            <div>
              <p className="font-medium mb-1">Shipping:</p>
              <p>Cash on Delivery (COD) available. Default shipping method is Amana. Shipping details will be confirmed during checkout.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Returns:</p>
              <p>Please contact the artisan directly for return and refund policies.</p>
            </div>
          </div>
        </ProductCollapsibleSection>

        {/* More from this Artisan */}
        {moreProductsWithCover.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">More from this Artisan</h2>
              <Link href={`/store/${store.slug}`}>
                <Button variant="ghost" size="sm">
                  VIEW ALL
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {moreProductsWithCover.map((p: any) => (
                <div key={p.id} className="flex-shrink-0 w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Add to Cart (non-sticky) */}
        <div className="hidden md:flex items-center gap-4 max-w-md pt-6">
          <AddToCartWithQuantity productId={product.id} />
        </div>
      </div>

      {/* Sticky Footer: Quantity Selector + Add to Basket (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4 md:hidden">
        <div className="container mx-auto">
          <AddToCartWithQuantity productId={product.id} />
        </div>
      </div>
    </div>
  );
}
