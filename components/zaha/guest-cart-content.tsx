"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { getGuestCart, removeFromGuestCart, updateGuestCartQuantity, clearGuestCart } from "@/lib/utils/guest-cart";
import { GuestCheckoutModal } from "./guest-checkout-modal";

interface Product {
  id: string;
  title: string;
  price: number;
  promoted_price: number | null;
  currency: string;
  product_media: Array<{
    media_url: string;
    is_cover: boolean;
    order_index: number;
  }>;
  stores: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export function GuestCartContent(): React.ReactElement {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    loadCart();
    
    // Listen for guest cart updates
    const handleGuestCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener("guestCartUpdated", handleGuestCartUpdate);
    return () => {
      window.removeEventListener("guestCartUpdated", handleGuestCartUpdate);
    };
  }, []);

  async function loadCart() {
    try {
      const guestCart = getGuestCart();
      
      // Fetch product details for each item
      const productPromises = guestCart.map(async (item) => {
        try {
          const response = await fetch(`/api/products/${item.productId}`);
          if (response.ok) {
            const data = await response.json();
            return {
              ...item,
              product: data.product,
            };
          }
          return item;
        } catch (error) {
          console.error(`Failed to fetch product ${item.productId}:`, error);
          return item;
        }
      });
      
      const itemsWithProducts = await Promise.all(productPromises);
      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error("Failed to load guest cart:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function removeItem(productId: string) {
    setIsUpdating(productId);
    try {
      removeFromGuestCart(productId);
      loadCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(null);
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    setIsUpdating(productId);
    try {
      updateGuestCartQuantity(productId, quantity);
      loadCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(null);
    }
  }

  function handleCheckout() {
    setCheckoutModalOpen(true);
  }

  function handleContinueAsGuest() {
    // For now, redirect to login - in a real app, you'd handle guest checkout
    router.push("/auth/login");
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.promoted_price || item.product.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Cart Items */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          {cartItems.map((item) => {
            if (!item.product) return null;
            
            const promotedPrice = item.product.promoted_price 
              ? Number(item.product.promoted_price) 
              : null;
            const currentPrice = promotedPrice || Number(item.product.price);
            const originalPrice = promotedPrice ? Number(item.product.price) : null;
            const discount = originalPrice && promotedPrice
              ? Math.round(((originalPrice - promotedPrice) / originalPrice) * 100)
              : null;

            const priceFormatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: item.product.currency || "MAD",
            }).format(currentPrice);

            const originalPriceFormatted = originalPrice
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: item.product.currency || "MAD",
                }).format(originalPrice)
              : null;

            const mediaArray = Array.isArray(item.product.product_media) 
              ? item.product.product_media 
              : [];
            const coverMedia = mediaArray.find((m) => m.is_cover) || mediaArray[0];

            return (
              <Card key={item.productId} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/p/${item.product.id}`} className="flex-shrink-0">
                      <div className="relative w-24 h-24 bg-muted rounded">
                        {coverMedia?.media_url ? (
                          <Image
                            src={coverMedia.media_url}
                            alt={item.product.title}
                            fill
                            className="object-cover rounded"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link href={`/store/${item.product.stores.slug}`}>
                            <p className="text-sm text-muted-foreground hover:text-primary mb-1">
                              {item.product.stores.name}
                            </p>
                          </Link>
                          <Link href={`/p/${item.product.id}`}>
                            <h3 className="font-semibold hover:text-primary line-clamp-2 mb-2">
                              {item.product.title}
                            </h3>
                          </Link>
                          {discount && (
                            <Badge variant="default" className="bg-green-500 text-white text-xs mb-2">
                              {discount}% de réduction
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          disabled={isUpdating === item.productId}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {originalPriceFormatted ? (
                          <>
                            <span className="font-bold text-base text-red-500">
                              {priceFormatted}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {originalPriceFormatted}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-base">
                            {priceFormatted}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            updateQuantity(item.productId, newQuantity);
                          }}
                          disabled={isUpdating === item.productId}
                          className="w-20 h-8 border border-input bg-background px-2 py-1 text-sm rounded"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="border border-border sticky top-4">
            <CardContent className="p-6">
              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Mode de paiement</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                  <div className="w-10 h-6 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                  <div className="w-10 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AE</div>
                  <div className="w-10 h-6 bg-orange-400 rounded text-white text-xs flex items-center justify-center font-bold">DC</div>
                  <div className="w-10 h-6 bg-black rounded text-white text-xs flex items-center justify-center font-bold">GP</div>
                </div>
              </div>

              {/* Order Summary */}
              <h3 className="text-lg font-semibold mb-4">Résumé de la commande</h3>
              <div className="space-y-3 mb-4">
                <div className="text-xs text-blue-600 mb-2">
                  Vous êtes couvert par la Protection sur les achats
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total des articles</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(subtotal)}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Sous-total</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(subtotal)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
              >
                Finaliser la commande
              </Button>

              {/* Promo Code */}
              <div className="mb-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-green-600 cursor-pointer hover:text-green-700">
                  <Tag className="h-4 w-4" />
                  <span>Appliquer le code promo</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Taxes locales incluses (si applicables)</p>
                <p className="text-blue-600 hover:underline cursor-pointer">
                  En savoir plus sur les frais et taxes supplémentaires pouvant s&apos;appliquer
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <GuestCheckoutModal
        open={checkoutModalOpen}
        onOpenChange={setCheckoutModalOpen}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
}

