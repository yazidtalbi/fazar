import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailCarousel } from "@/components/zaha/product-detail-carousel";
import { ProductDetailCarouselEtsy } from "@/components/zaha/product-detail-carousel-etsy";
import { ProductCollapsibleSection } from "@/components/zaha/product-collapsible-section";
import { AddToCartWithQuantity } from "@/components/zaha/add-to-cart-with-quantity";
import { EstimatedReadyDate } from "@/components/zaha/estimated-ready-date";
import { ProductStickyHeader } from "@/components/zaha/product-sticky-header";
import { Bookmark, MapPin, ArrowRight, Star, ChevronRight, MessageCircle, Heart, Mail, CheckCircle2, Calendar, Package, Truck, Ruler, Weight, Hand, Scissors, Hash } from "lucide-react";
import { ProductCard } from "@/components/zaha/product-card";
import { AddToCartButtonDesktop } from "@/components/zaha/add-to-cart-button-desktop";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { StoreContactSheet } from "@/components/zaha/store-contact-sheet";
import { ProductVariations } from "@/components/zaha/product-variations";
import { ProductReviewSection } from "@/components/zaha/product-review-section";
import { ProductReviewsList } from "@/components/zaha/product-reviews-list";

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
        created_at,
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

  // Get product variations
  const { data: variations } = await supabase
    .from("product_variations")
    .select(`
      *,
      product_variation_options(*)
    `)
    .eq("product_id", id)
    .order("order_index");

  // Get product personalizations
  const { data: personalizations } = await supabase
    .from("product_personalizations")
    .select("*")
    .eq("product_id", id)
    .order("order_index");

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

  // Get similar products from the same category
  const categoryId = (product.categories as any)?.id;
  const { data: similarProducts } = categoryId
    ? await supabase
        .from("products")
        .select(`
          *,
          product_media(media_url, media_type, order_index, is_cover),
          stores!inner(id, name, slug)
        `)
        .eq("category_id", categoryId)
        .eq("status", "active")
        .neq("id", product.id)
        .neq("store_id", product.stores.id) // Exclude products from the same store
        .limit(8)
    : { data: null };

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

  // Get cover media for similar products
  const similarProductsWithCover = (similarProducts || []).map((p: any) => {
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

  // Fetch real reviews data
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", product.id);

  const reviews = reviewsData || [];
  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  // Fetch real sales count for the store
  const { data: storeProducts } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", store.id)
    .eq("status", "active");

  const storeProductIds = storeProducts?.map(p => p.id) || [];
  let storeSalesCount = 0;
  if (storeProductIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity")
      .in("product_id", storeProductIds);
    
    storeSalesCount = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }

  // Calculate years on OFUS
  const yearsOnOfus = new Date().getFullYear() - new Date(store.created_at).getFullYear();

  const coverMedia = media[0]?.media_url || null;
  const category = product.categories as any;

  // Mock data for cart count and discount
  const cartCount = Math.floor(Math.random() * 30) + 5;
  const originalPrice = product.price ? Number(product.price) * 1.8 : null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Sticky Header (Mobile) */}
      <ProductStickyHeader title={product.title} imageUrl={coverMedia} productId={product.id} />
      
      {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
      <div className="hidden md:block h-[169px]"></div>
      
      {/* Breadcrumbs */}
      <div className="hidden md:block border-b bg-white border-gray-200">
        <div className="max-w-[100rem] mx-auto px-12 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/app" className="hover:text-foreground">Home</Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Trust Indicators Bar (Ruban) */}
      <div className="hidden md:block bg-gray-100 border-b border-gray-200">
        <div className="max-w-[100rem] mx-auto px-12 py-3">
          <div className="flex items-center gap-6 text-sm text-[#222222]">
            <span className="font-medium">Achetez en toute confiance sur OFUS</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="underline decoration-dotted cursor-pointer hover:text-[#222222]/70">
                Protection sur les achats d'OFUS
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="underline decoration-dotted cursor-pointer hover:text-[#222222]/70">
                Options de paiement sécurisées
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[#222222] text-[#222222]" />
              <span className="underline decoration-dotted cursor-pointer hover:text-[#222222]/70">
                Avis vérifiés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Desktop Side-by-Side Layout */}
      <div className="max-w-[100rem] mx-auto px-12 py-6 md:py-8 bg-white md:bg-white">
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Left: Product Images */}
          <div className="col-span-8">
            <ProductDetailCarouselEtsy media={media} />
            <div className="mt-4 text-xs text-muted-foreground">
              <Link href="#" className="hover:underline">Report this item</Link>
            </div>
            {/* Empty space below image to align with collapsibles */}
            <div className="mt-8"></div>
          </div>

          {/* Right: Product Details */}
          <div className="col-span-4 ">
            {/* Cart Count */}
            <div className="text-sm text-muted-foreground mb-4">
              In {cartCount}+ carts
            </div>

            {/* Price */}
            <div className="flex items-baseline gap- mb-4">
              <span className="text-3xl font-bold mr-4">{Number(product.price).toLocaleString()} {product.currency || "MAD"}</span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice.toLocaleString()} {product.currency || "MAD"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-[#222222] mb-2">{product.title}</h1>

            {/* Seller Info with Rating */}
            <div className="flex items-center gap-2 -mt-1">
              <Link href={`/store/${store.slug}`} className="text-sm font-medium hover:underline">
               By  {store.name}
              </Link>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : i < rating ? "fill-primary/50 text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({rating > 0 ? rating.toFixed(1) : '0.0'})</span>
            </div>

            {/* Keywords */}
            {(product as any).keywords && Array.isArray((product as any).keywords) && (product as any).keywords.length > 0 && (
              <div className="pt-4">
                <p className="text-sm text-[#222222]">
                  {(product as any).keywords.join(", ")}
                </p>
              </div>
            )}

            {/* Variations & Personalizations */}
            {(variations && variations.length > 0) || (personalizations && personalizations.length > 0) ? (
              <div className="pt-4">
                <ProductVariations
                  variations={(variations || []).map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    display_name: v.display_name,
                    is_required: v.is_required,
                    options: (v.product_variation_options || []).map((opt: any) => ({
                      id: opt.id,
                      value: opt.value,
                      display_value: opt.display_value,
                      price_modifier: opt.price_modifier || 0,
                    })),
                  }))}
                  personalizations={(personalizations || []).map((p: any) => ({
                    id: p.id,
                    label: p.label,
                    placeholder: p.placeholder,
                    max_length: p.max_length,
                    is_required: p.is_required,
                    price_modifier: p.price_modifier || 0,
                  }))}
                />
              </div>
            ) : null}

            {/* Add to Cart Button */}
            <div className="pt-4">
              <AddToCartButtonDesktop productId={product.id} />
            </div>

            {/* Item Details (Collapsible) */}
            <div className="border-t pt-4">
              <ProductCollapsibleSection title="Détails de l'article" defaultOpen={true}>
                <div className="space-y-3 text-sm">
                  <div className="font-semibold mb-2">Principaux détails</div>
                  <div className="flex items-start gap-3">
                    <Hand className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Fabriqué par </span>
                      <Link href={`/store/${store.slug}`} className="font-semibold hover:underline">{store.name}</Link>
                    </div>
                  </div>
                  {(product as any).materials && (
                    <div className="flex items-start gap-3">
                      <Scissors className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Matériaux: </span>
                        <span>{(product as any).materials}</span>
                      </div>
                    </div>
                  )}
                  {(product as any).size && (
                    <div className="flex items-start gap-3">
                      <Ruler className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Taille: </span>
                        <span>{(product as any).size}</span>
                      </div>
                    </div>
                  )}
                  {(product as any).weight && (
                    <div className="flex items-start gap-3">
                      <Weight className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Poids: </span>
                        <span>{(product as any).weight}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Condition: </span>
                    <span>{product.condition || "New"}</span>
                  </div>
                  {category && (
                    <div>
                      <span className="font-semibold">Category: </span>
                      <span>{category.name}</span>
                    </div>
                  )}
                  {product.days_to_craft > 0 && (
                    <div>
                      <span className="font-semibold">Days to craft: </span>
                      <span>{product.days_to_craft} days</span>
                    </div>
                  )}
                </div>
              </ProductCollapsibleSection>

              {/* Description */}
              <ProductCollapsibleSection title="Description" defaultOpen={true}>
                <div className="text-sm whitespace-pre-line">
                  {product.description || "No description available."}
                </div>
              </ProductCollapsibleSection>

              {/* Conditions de livraison et de retour */}
              <ProductCollapsibleSection title="Conditions de livraison et de retour">
                <div className="space-y-3 text-sm">
                  {(product as any).delivery_estimate_days > 0 && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span>Commandez aujourd&apos;hui pour une réception d&apos;ici le </span>
                        <span className="underline decoration-dotted">
                          {new Date(Date.now() + (product as any).delivery_estimate_days * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    </div>
                  )}
                  {(product as any).return_policy && (
                    <div className="flex items-start gap-3">
                      <Package className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="underline decoration-dotted">{(product as any).return_policy}</span>
                      </div>
                    </div>
                  )}
                  {(product as any).shipping_cost !== null && (product as any).shipping_cost !== undefined && (
                    <div className="flex items-start gap-3">
                      <Truck className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Frais d&apos;envoi : </span>
                        <span>{(product as any).shipping_cost.toLocaleString()} {product.currency || "MAD"}</span>
                      </div>
                    </div>
                  )}
                  {(product as any).shipping_origin_country && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Pays d&apos;expédition : </span>
                        <span>{(product as any).shipping_origin_country}</span>
                      </div>
                    </div>
                  )}
                  {(product as any).delivery_conditions && (
                    <div className="mt-3">
                      <p className="text-muted-foreground">{(product as any).delivery_conditions}</p>
                    </div>
                  )}
                  {!((product as any).delivery_estimate_days > 0 || (product as any).return_policy || (product as any).shipping_cost !== null) && (
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium mb-1">Shipping:</p>
                        <p>Cash on Delivery (COD) available. Default shipping method is Amana. Shipping details will be confirmed during checkout.</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Returns:</p>
                        <p>Please contact the artisan directly for return and refund policies.</p>
                      </div>
                    </div>
                  )}
                </div>
              </ProductCollapsibleSection>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          <ProductDetailCarousel media={media} />
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{Number(product.price).toLocaleString()} {product.currency || "MAD"}</span>
            </div>

            <div className="flex items-center gap-2">
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
                      <span className="font-semibold">{store.name}</span>
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

            {product.days_to_craft > 0 && (
              <EstimatedReadyDate daysToCraft={product.days_to_craft} />
            )}

            <ProductCollapsibleSection title="Description" defaultOpen={true}>
              {product.description || "No description available."}
            </ProductCollapsibleSection>

            <ProductCollapsibleSection title="Specifications">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Condition:</span>
                  <span>{product.condition || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{category?.name || "Uncategorized"}</span>
                </div>
              </div>
            </ProductCollapsibleSection>
          </div>
        </div>

        {/* Reviews, Store Info and Delivery - Aligned to left (8 columns) */}
        <div className="hidden md:block mt-12 md:mt-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Content - 8 columns (matching image section width) */}
            <div className="col-span-8 space-y-8">
              {/* Review Form Section */}
              <ProductReviewSection productId={product.id} />

              {/* Reviews List Section */}
              <ProductReviewsList productId={product.id} />

              {/* Seller Information Section */}
              <div className="border-t pt-8">
                <div className="border rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {store.logo_url ? (
                        <Image
                          src={store.logo_url}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/store/${store.slug}`} className="text-xl font-semibold hover:underline">
                          {store.name}
                        </Link>
                        {sellerProfile?.is_verified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Managed by {store.name.split(' ')[0]} • Morocco
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span>{rating > 0 ? rating.toFixed(1) : '0.0'} ({reviewCount > 1000 ? (reviewCount / 1000).toFixed(1) + 'K' : reviewCount})</span>
                        </div>
                        <span>{storeSalesCount > 1000 ? (storeSalesCount / 1000).toFixed(1) + 'K' : storeSalesCount.toLocaleString()} {storeSalesCount === 1 ? 'sale' : 'sales'}</span>
                        <span>{yearsOnOfus > 0 ? `${yearsOnOfus} ${yearsOnOfus === 1 ? 'year' : 'years'}` : new Date(store.created_at).getFullYear()} on OFUS</span>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <StoreContactSheet store={store}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Message seller
                          </Button>
                        </StoreContactSheet>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Follow shop
                        </Button>
                      </div>
                      
                      {/* Performance Indicators */}
                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium">Quick responses</span>
                          <span className="text-muted-foreground">Responds quickly to received messages</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">Enthusiastic reviews</span>
                          <span className="text-muted-foreground">Average rating is at least 4.8</span>
                        </div>
                      </div>

                      {/* Shop Reviews Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">All reviews for this shop ({reviewCount > 1000 ? (reviewCount / 1000).toFixed(1) + 'K' : reviewCount})</h3>
                          <Link href={`/store/${store.slug}`}>
                            <Button variant="ghost" size="sm">Show all</Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {/* Mock shop reviews */}
                          {[
                            { name: "CHABREYRON", date: "25 nov. 2025", rating: 5, text: "Papier fait main, papier vintage... Fast, compliant, printer-friendly." },
                            { name: "stecher126", date: "03 déc. 2025", rating: 5, text: "Gorgeous box it was shipped in and the journal itself." },
                            { name: "Kimberly", date: "06 nov. 2025", rating: 5, text: "Joli papier qui correspond aux besoins et attentes." },
                          ].map((review, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">{review.name}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{review.date}</p>
                              <p className="text-sm line-clamp-3">{review.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Section */}
              <div className="border-t pt-8">
                <h3 className="font-semibold mb-3">Delivery</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPVIdf8YZlvP4g3NMdcuZgf5IMn2AoLYZQ-g&s"
                      alt="Amana"
                      width={60}
                      height={16}
                      className="object-contain h-4"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    Cash on Delivery (COD) available. Shipping details will be confirmed during checkout.
                  </p>
                  <p className="text-muted-foreground mt-3">
                    Returns, exchanges, or cancellations may be available. 
                    Please contact the creator if you have any problems with your order.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right spacer - 4 columns (matching product details width) */}
            <div className="col-span-4"></div>
          </div>
        </div>

        {/* Similar Articles */}
        {similarProductsWithCover && similarProductsWithCover.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Similar articles</h2>
              {category && (
                <Link href={`/categories/${category.slug}`}>
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              )}
            </div>
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarProductsWithCover.slice(0, 5).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {/* Mobile: show horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {similarProductsWithCover.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex-shrink-0 w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* More from this Artisan */}
        {moreProductsWithCover.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Other items from this shop</h2>
              <Link href={`/store/${store.slug}`}>
                <Button variant="ghost" size="sm">
                  View shop
                </Button>
              </Link>
            </div>
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4">
              {moreProductsWithCover.slice(0, 5).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {/* Mobile: show horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {moreProductsWithCover.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex-shrink-0 w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Searches Section */}
        <div className="hidden md:block mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-6">Related searches</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Related Search Cards */}
            {[
              { title: "Calligraphie", image: "📝" },
              { title: "Parchemin", image: "📜" },
            ].map((item, idx) => (
              <Link key={idx} href={`/search?q=${encodeURIComponent(item.title)}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* More Related Search Tags */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">See more related searches</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Papier recyclé",
                "Déchiré à la main",
                "Marque-places",
                "Chiffon en coton",
                "Papier à lettres",
                "Papier vintage",
                "Numéros de tableau",
                "Papier fait main",
                "Papier de chanvre",
                "Papier de bordure",
                "Papier de calligraphie",
              ].map((tag, idx) => (
                <Link key={idx} href={`/search?q=${encodeURIComponent(tag)}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 rounded-full"
                  >
                    {tag}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer: Quantity Selector + Add to Basket (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4 md:hidden">
        <div className="container mx-auto">
          <AddToCartWithQuantity productId={product.id} />
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block mt-16">
        <Footer />
      </div>
    </div>
  );
}
