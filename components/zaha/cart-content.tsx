"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Heart, Tag } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  products: {
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
  };
}

export function CartContent(): React.ReactElement {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (data.cartItems) {
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeItem(productId: string) {
    setIsUpdating(productId);
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await loadCart();
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(null);
    }
  }

  async function saveForLater(productId: string) {
    setIsUpdating(productId);
    try {
      // First remove from cart
      const deleteResponse = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to remove from cart");
      }

      // Then add to saved items
      const saveResponse = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save item");
      }

      await loadCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      toast.success("Item saved for later");
    } catch (error) {
      console.error("Failed to save item:", error);
      toast.error("Failed to save item");
    } finally {
      setIsUpdating(null);
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/app">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.products.promoted_price || item.products.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left Column - Cart Items */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Votre panier</h2>
        {cartItems.map((item) => {
          const coverMedia = item.products.product_media?.find((m) => m.is_cover) || item.products.product_media?.[0];
          const currentPrice = item.products.promoted_price || item.products.price;
          const originalPrice = item.products.promoted_price ? item.products.price : null;
          const discount = originalPrice && item.products.promoted_price
            ? Math.round(((originalPrice - item.products.promoted_price) / originalPrice) * 100)
            : null;

          const priceFormatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: item.products.currency || "MAD",
          }).format(currentPrice);

          const originalPriceFormatted = originalPrice
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: item.products.currency || "MAD",
              }).format(originalPrice)
            : null;

          return (
            <Card key={item.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/p/${item.products.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 bg-muted rounded">
                      {coverMedia?.media_url ? (
                        <Image
                          src={coverMedia.media_url}
                          alt={item.products.title}
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
                        <Link href={`/store/${item.products.stores.slug}`}>
                          <p className="text-sm text-muted-foreground hover:text-primary mb-1">
                            {item.products.stores.name}
                          </p>
                        </Link>
                        <Link href={`/p/${item.products.id}`}>
                          <h3 className="font-semibold hover:text-primary line-clamp-2 mb-2">
                            {item.products.title}
                          </h3>
                        </Link>
                        {discount && (
                          <Badge variant="default" className="bg-green-500 text-white text-xs mb-2">
                            {discount}% de réduction
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {originalPriceFormatted ? (
                        <>
                          <span className="font-bold text-base text-red-500">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: item.products.currency || "MAD",
                            }).format(currentPrice)}
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
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveForLater(item.products.id)}
                        disabled={isUpdating === item.products.id}
                        className="text-xs"
                      >
                        Mettre de côté
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.products.id)}
                        disabled={isUpdating === item.products.id}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
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
        <Card className="border border-gray-200 sticky top-4">
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

            <Link href="/app/checkout" className="block mb-4">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Finaliser la commande
              </Button>
            </Link>

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
  );
}
