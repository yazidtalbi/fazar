"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Database } from "@/lib/database.types";
import { format } from "date-fns";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { addToGuestCart } from "@/lib/utils/guest-cart";
import { useSavedItems } from "@/components/saved-items-provider";
import { cn, isArabic } from "@/lib/utils";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  product_media: Array<{
    media_url: string;
    media_type: "image" | "video";
    is_cover: boolean;
    order_index: number;
  }>;
  stores: {
    name: string;
    slug: string;
  };
};

interface ProductCardProps {
  product: Product;
}

function EstimatedReadyDate({ daysToCraft }: { daysToCraft: number }): React.ReactElement {
  if (daysToCraft === 0) return <span className="text-xs text-muted-foreground">Ready now</span>;
  
  const readyDate = addDays(new Date(), daysToCraft);
  return (
    <span className="text-xs text-muted-foreground">
      Ready by {format(readyDate, "EEE, d MMM")}
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  const router = useRouter();
  const { savedItems, refreshSavedItems } = useSavedItems();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  
  // Compute isSaved from savedItems
  const isSaved = useMemo(() => {
    return savedItems.some((item: any) => item.product_id === product.id);
  }, [savedItems, product.id]);
  
  // Handle product_media - it might be an array or an object
  let mediaArray: Array<{
    media_url: string;
    media_type: "image" | "video";
    is_cover: boolean;
    order_index: number;
  }> = [];
  
  if (Array.isArray(product.product_media)) {
    mediaArray = product.product_media.filter((m: any) => m && m.media_url);
  } else if (product.product_media && typeof product.product_media === 'object') {
    // Handle case where it might be a single object or nested structure
    const media = product.product_media as any;
    if (media.media_url) {
      mediaArray = [media];
    } else if (Array.isArray(media)) {
      mediaArray = media.filter((m: any) => m && m.media_url);
    }
  }
  
  // Debug: log if no media found
  if (mediaArray.length === 0 && process.env.NODE_ENV === 'development') {
    console.log('No media found for product:', product.id, product.title, 'product_media:', product.product_media);
  }
  
  const sortedMedia = [...mediaArray].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const coverMedia = sortedMedia.find((m) => m.is_cover) || sortedMedia[0];
  const secondMedia = sortedMedia.length > 1 ? sortedMedia[1] : null;
  
  // Calculate discount if promoted price exists
  // Check if product has a promoted_price field (from database)
  const promotedPrice = (product as any).promoted_price 
    ? Number((product as any).promoted_price) 
    : null;
  const currentPrice = promotedPrice || Number(product.price);
  const originalPrice = promotedPrice ? Number(product.price) : null;
  const discount = originalPrice && promotedPrice
    ? Math.round(((originalPrice - promotedPrice) / originalPrice) * 100)
    : null;
  
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "MAD",
  }).format(currentPrice);
  const originalPriceFormatted = originalPrice 
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: product.currency || "MAD",
      }).format(originalPrice)
    : null;

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkUser();
  }, []);

  useEffect(() => {
    async function fetchProductStats() {
      const supabase = createClient();
      
      // Fetch reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id);
      
      if (reviews && reviews.length > 0) {
        setReviewCount(reviews.length);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setRating(avgRating);
      }
      
      // Fetch order count
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("quantity")
        .eq("product_id", product.id);
      
      if (orderItems) {
        const totalOrders = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setOrderCount(totalOrders);
      }
    }
    fetchProductStats();
  }, [product.id]);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please log in to save items");
      return;
    }
    
    setIsSaving(true);
    try {
      const url = isSaved 
        ? `/api/saved?productId=${product.id}` 
        : "/api/saved";
      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: isSaved ? undefined : JSON.stringify({ productId: product.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      // Refresh saved items in context to update all components
      await refreshSavedItems();
      
      if (!isSaved) {
        toast.success("Product added to saved items");
      } else {
        toast.success("Product removed from saved items");
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // If guest, use localStorage
    if (!user) {
      setIsAddingToCart(true);
      try {
        addToGuestCart(product.id, 1);
        toast.success("Item added to cart");
        // Redirect to cart page (will need to handle guest cart)
        router.push("/cart");
      } catch (error: any) {
        console.error("Error adding to guest cart:", error);
        toast.error("Failed to add item to cart");
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    // For authenticated users, use API
    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      toast.success("Item added to cart");
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      // Redirect to cart page
      router.push("/cart");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="group relative w-full">
      <Card className="rounded-none border-0 bg-transparent w-full">
        <Link href={`/p/${product.id}`}>
          {/* Desktop: Hover image, Mobile: Carousel */}
          <div className="relative aspect-square w-full bg-muted overflow-hidden arabic-frame will-change-transform transform-gpu">
            {/* Mobile: Carousel for multiple images */}
            <div className="md:hidden w-full h-full relative">
              {sortedMedia.length > 0 ? (
                sortedMedia.length === 1 ? (
                  // Single image
                  sortedMedia[0].media_type === "video" ? (
                    <video
                      src={sortedMedia[0].media_url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  ) : sortedMedia[0].media_url ? (
                    <Image
                      src={sortedMedia[0].media_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw"
                      priority
                      unoptimized={sortedMedia[0].media_url.includes('supabase.co')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-muted">
                      No image
                    </div>
                  )
                ) : (
                  // Multiple images - use carousel
                  <Carousel className="w-full h-full" opts={{ align: "start", loop: false, skipSnaps: false }}>
                    <CarouselContent className="h-full -ml-0">
                      {sortedMedia.map((item, index) => (
                        <CarouselItem key={`${product.id}-${index}`} className="h-full pl-0 basis-full">
                          <div className="relative w-full h-full">
                            {item.media_type === "video" ? (
                              <video
                                src={item.media_url}
                                className="w-full h-full object-cover"
                                controls
                                playsInline
                              />
                            ) : item.media_url ? (
                              <Image
                                src={item.media_url}
                                alt={`${product.title} ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw"
                                priority={index === 0}
                                unoptimized={item.media_url.includes('supabase.co')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-muted">
                                No image
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-muted">
                  No image
                </div>
              )}
            </div>

            {/* Desktop: Hover media effect */}
            <div className="hidden md:block relative w-full h-full group/image">
              {coverMedia?.media_url ? (
                <>
                  {/* Default Media (Cover) */}
                  {coverMedia.media_type === "video" ? (
                    <video
                      src={coverMedia.media_url}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        secondMedia ? "group-hover/image:opacity-0" : ""
                      }`}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={coverMedia.media_url}
                      alt={product.title}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        secondMedia ? "group-hover/image:opacity-0" : ""
                      }`}
                      sizes="(max-width: 1200px) 33vw, 25vw"
                    />
                  )}

                  {/* Hover Media (Second item if available) */}
                  {secondMedia && secondMedia.media_url && (
                    <>
                      {secondMedia.media_type === "video" ? (
                        <video
                          src={secondMedia.media_url}
                          className="w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 absolute inset-0"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <Image
                          src={secondMedia.media_url}
                          alt={`${product.title} hover`}
                          fill
                          className="object-cover opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 absolute inset-0"
                          sizes="(max-width: 1200px) 33vw, 25vw"
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No media
                </div>
              )}
            </div>
            {/* Heart Icon - Top Right (Always visible on mobile, hover on desktop) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (user) {
                  handleSave(e);
                } else {
                  toast.error("Please log in to save items");
                }
              }}
              disabled={isSaving}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white rounded-full p-2 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label={isSaved ? "Remove from saved" : "Save product"}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  isSaved ? "fill-red-500 text-red-500" : "text-gray-700"
                }`} 
              />
            </button>

            {/* Discount Badge - Top Left */}
            {discount && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-green-600 text-white text-xs font-semibold px-2 py-1">
                  -{discount}%
                </Badge>
              </div>
            )}
            {product.is_promoted && !discount && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="default" className="text-xs">
                  Promoted
                </Badge>
              </div>
            )}
            {product.is_trending && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="secondary" className="text-xs">
                  Trending
                </Badge>
              </div>
            )}
          </div>
        </Link>
        <CardContent className="pt-4 px-0 pb-2">
          <Link href={`/p/${product.id}`}>
            <h3 
              className={cn(
                "font-medium text-sm line-clamp-2 text-[#222222] mb-1",
                isArabic(product.title) && "font-arabic"
              )}
              dir={isArabic(product.title) ? "rtl" : "ltr"}
            >
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              {originalPriceFormatted ? (
                <>
                  <span className="font-bold text-green-600 text-base">
                    {priceFormatted}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {originalPriceFormatted}
                  </span>
                </>
              ) : (
                <span className="font-bold text-[#222222] text-base no-underline">
                  {priceFormatted}
                </span>
              )}
            </div>
          </Link>
        </CardContent>
      </Card>
      {/* Reviews, Orders and Add to Cart Info */}
      <div className="flex flex-col gap-2 mt-2 px-0">
        <div className="flex items-center justify-between min-h-[20px]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {reviewCount > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-sm">({reviewCount})</span>
              </div>
            ) : (
              <div className="h-4" /> // Empty space placeholder
            )}
            {reviewCount > 0 && orderCount > 0 && <span>•</span>}
            {orderCount > 0 && (
              <span className="text-sm">{orderCount} {orderCount === 1 ? 'order' : 'orders'}</span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button - Visible on hover for desktop, always for mobile */}
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-6 font-semibold text-base transition-all shadow-sm md:opacity-0 md:group-hover:opacity-100"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAddingToCart ? "Ajout..." : "Ajouter au panier"}
        </Button>
      </div>
    </div>
  );
}

