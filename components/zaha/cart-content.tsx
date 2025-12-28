"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    currency: string;
    stock_quantity: number;
    product_media: Array<{
      media_url: string;
      is_cover: boolean;
      order_index: number;
    }>;
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

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }

    setIsUpdating(productId);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      await loadCart();
    } catch (error) {
      console.error("Failed to update cart:", error);
      alert("Failed to update cart");
    } finally {
      setIsUpdating(null);
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
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item");
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
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {cartItems.map((item) => {
          const coverMedia = item.products.product_media?.find((m) => m.is_cover) || item.products.product_media?.[0];
          const priceFormatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: item.products.currency || "MAD",
          }).format(Number(item.products.price));

          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/p/${item.products.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 bg-muted">
                      {coverMedia?.media_url ? (
                        <Image
                          src={coverMedia.media_url}
                          alt={item.products.title}
                          fill
                          className="object-cover"
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
                    <Link href={`/p/${item.products.id}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary line-clamp-2">
                        {item.products.title}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold mb-4">{priceFormatted}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</label>
                        <input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          max={item.products.stock_quantity}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.products.id, parseInt(e.target.value) || 1)}
                          disabled={isUpdating === item.products.id}
                          className="w-20 h-8 border border-input bg-background px-2 py-1 text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.products.id)}
                        disabled={isUpdating === item.products.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">SUMMARY</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping estimate</span>
                <span>Calculated next step</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax</span>
                <span>0.00 MAD</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(subtotal)}
                </span>
              </div>
            </div>
            <Link href="/app/checkout">
              <Button className="w-full">PROCEED TO CHECKOUT →</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

