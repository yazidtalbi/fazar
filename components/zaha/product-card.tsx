"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import type { Database } from "@/lib/database.types";
import { format } from "date-fns";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const mediaArray = Array.isArray(product.product_media) ? product.product_media : [];
  const coverMedia = mediaArray.find((m) => m.is_cover) || mediaArray[0];
  
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
    async function checkUserAndSaved() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        try {
          const response = await fetch("/api/saved");
          if (response.ok) {
            const data = await response.json();
            const savedItems = data.savedItems || [];
            const saved = savedItems.some((item: any) => item.product_id === product.id);
            setIsSaved(saved);
          }
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    }
    checkUserAndSaved();
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

      setIsSaved(!isSaved);
      
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
      router.push("/app/cart");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="group relative">
      <Link href={`/p/${product.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white">
          <div className="relative aspect-square w-full bg-muted">
            {coverMedia?.media_url ? (
              <Image
                src={coverMedia.media_url}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
            {/* Heart Icon - Top Right (Always visible on mobile, hover on desktop) */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label={isSaved ? "Remove from saved" : "Save product"}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  isSaved ? "fill-red-500 text-red-500" : "text-gray-700"
                }`} 
              />
            </button>
            {/* Add to Cart Button - Bottom Center (Desktop only on hover) */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-[#222222] text-white px-4 py-2 rounded-md font-medium text-sm transition-all opacity-0 md:group-hover:opacity-100 hover:bg-[#333333] shadow-lg whitespace-nowrap"
            >
              {isAddingToCart ? "Ajout..." : "Ajouter au panier"}
            </button>
            {/* Discount Badge - Top Left */}
            {discount && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1">
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
          <CardContent className="pt-4 px-4 pb-4">
            <h3 className="font-medium text-sm line-clamp-2 text-[#222222] min-h-[2.5rem] mb-0">
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2">
              {originalPriceFormatted ? (
                <>
                  <span className="font-bold text-red-500 text-base">
                    {priceFormatted}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {originalPriceFormatted}
                  </span>
                </>
              ) : (
                <span className="font-bold text-[#222222] text-base">
                  {priceFormatted}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

