import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorePageTabs } from "@/components/zaha/store-page-tabs";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { FollowButton } from "@/components/zaha/follow-button";
import { MessageStoreButton } from "@/components/zaha/message-store-button";
import { ArrowLeft, Search, Share2, MapPin, ShoppingCart, Star, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/zaha/product-card";
import { StoreProductsClient } from "@/components/zaha/store-products-client";
import { StoreCollectionsSidebar } from "@/components/zaha/store-collections-sidebar";
import { StoreContactSheet } from "@/components/zaha/store-contact-sheet";

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

  // Get collections
  const { data: collections } = await supabase
    .from("collections")
    .select(`
      *,
      collection_products(
        product_id,
        products(
          id,
          title,
          price,
          currency,
          status,
          is_promoted,
          is_trending,
          is_featured,
          days_to_craft,
          product_media(media_url, media_type, order_index, is_cover)
        )
      )
    `)
    .eq("store_id", store.id)
    .order("order_index", { ascending: true });

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
      is_featured,
      days_to_craft,
      created_at,
      product_media(media_url, media_type, order_index, is_cover)
    `)
    .eq("store_id", store.id)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
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
  
  // Get product IDs for this store
  const productIds = productsWithCover.map(p => p.id);
  
  // Fetch real sales count (from order_items)
  let salesCount = 0;
  if (productIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity")
      .in("product_id", productIds);
    
    salesCount = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }
  
  // Fetch real reviews for products in this store
  let rating = 0;
  let reviewCount = 0;
  if (productIds.length > 0) {
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("rating")
      .in("product_id", productIds);
    
    const reviews = reviewsData || [];
    reviewCount = reviews.length;
    rating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  }
  
  // Calculate years on OFUS
  const yearsOnOfus = new Date().getFullYear() - new Date(store.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
      <div className="hidden md:block h-[169px]"></div>

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
      <div className="max-w-[100rem] mx-auto px-12 py-6 md:py-8 bg-white">
        {/* Store Header Section - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Store Logo */}
            <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden flex-shrink-0 border-2 border-white">
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                  {sellerProfile?.is_verified && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
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
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                  <span className="text-sm text-muted-foreground">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{salesCount.toLocaleString()} {salesCount === 1 ? 'sale' : 'sales'}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{(store as any).city || "Morocco"}</span>
                </div>
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
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{store.name}</h1>
                  {sellerProfile?.is_verified && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <FollowButton storeId={store.id} />
                  <MessageStoreButton 
                    storeId={store.id} 
                    sellerId={store.seller_id}
                    storeName={store.name}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span>{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                <span>•</span>
                <span>{salesCount.toLocaleString()} {salesCount === 1 ? 'sale' : 'sales'}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{(store as any).city || "Morocco"}</span>
                </div>
              </div>
            </div>
          </div>
          {store.description && (
            <p className="text-sm text-muted-foreground mb-4">{store.description}</p>
          )}
        </div>

        {/* Products Grid with Collections Sidebar */}
        <div className="flex gap-8">
          {/* Collections Sidebar - Desktop Only */}
          {collections && collections.length > 0 && (
            <StoreCollectionsSidebar 
              collections={collections.map((c: any) => ({ id: c.id, name: c.name }))} 
              storeSlug={store.slug}
            />
          )}
          
          {/* Products Content */}
          <div className="flex-1">
            <StoreProductsClient 
              products={productsWithCover} 
              collections={collections || []}
            />
          </div>
        </div>

        {/* Additional Information Sections */}
        <div className="border-t pt-8 space-y-12">
          {/* About Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">A propos de {store.name}</h3>
            </div>
            <div className="md:col-span-2">
              {store.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {store.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune description disponible.</p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ventes</div>
                  <div className="text-2xl font-bold">{salesCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sur OFUS depuis</div>
                  <div className="text-2xl font-bold">
                    {yearsOnOfus > 0 ? `${yearsOnOfus} ${yearsOnOfus === 1 ? 'an' : 'ans'}` : new Date(store.created_at).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Members Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Membres de la boutique</h3>
            </div>
            <div className="md:col-span-2">
              <div className="space-y-6">
                {/* Owner/Seller */}
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{store.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">Propriétaire, Designer, Fabricant</div>
                    <p className="text-sm text-gray-700">
                      Soutenez toutes sortes de personnalisation! Si vous avez des besoins de personnalisation, s&apos;il vous plaît contactez-moi!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Conditions générales de vente</h3>
            </div>
            <div className="md:col-span-2 space-y-8">
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Livraison</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Consultez les détails de l&apos;article pour obtenir une estimation de la date d&apos;arrivée.
                </p>
                <div>
                  <h5 className="font-semibold text-sm mb-2">Taxes de douane et d&apos;import</h5>
                  <p className="text-sm text-gray-700">
                    Les éventuelles taxes de douane et d&apos;importation sont à la charge des acheteurs. Je ne suis pas responsable des délais causés par la douane.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Options de paiement</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔒</span>
                  <span className="font-semibold text-sm">Options sécurisées</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded">Amana</div>
                </div>
                <p className="text-sm text-gray-700">
                  Les paiements sont traités de manière sécurisée. Les boutiques n&apos;ont jamais accès aux informations liées à votre carte de crédit.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Retours et échanges</h4>
                <p className="text-sm text-gray-700">
                  Consultez les détails de l&apos;article pour l&apos;éligibilité aux retours et aux échanges.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Annulations</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Annulations : non acceptées
                </p>
                <p className="text-sm text-gray-700">
                  Contactez le vendeur en cas de problème avec votre commande.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Desktop */}
        <div className="hidden md:block border-t pt-8 mb-12">
          <h3 className="text-xl font-semibold mb-6">Reviews</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{rating > 0 ? rating.toFixed(1) : '0.0'}</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : i < rating ? "fill-primary/50 text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>
            {reviewCount === 0 ? (
              <div className="text-sm text-muted-foreground">
                <p>No reviews yet. Be the first to leave a review!</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} from customers.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Contact Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4">
        <MessageStoreButton 
          storeId={store.id} 
          sellerId={store.seller_id}
          storeName={store.name}
        />
      </div>
    </div>
  );
}

