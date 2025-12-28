"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
}

export function CheckoutForm(): React.ReactElement {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingMethod: "Amana",
    phone: "",
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.shippingAddress.trim()) {
      setError("Shipping address is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: formData.shippingAddress,
          shippingMethod: formData.shippingMethod,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create order");
      }

      router.push(`/app/orders/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  const shippingCost = 0; // Can be calculated based on shipping method
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                placeholder="Enter full shipping address"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+212 6 00 00 00 00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingMethod">Shipping Method</Label>
              <select
                id="shippingMethod"
                className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
                value={formData.shippingMethod}
                onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
              >
                <option value="Amana">Amana</option>
                <option value="Aramex">Aramex</option>
                <option value="DHL">DHL</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cash on Delivery (COD) - Payment will be collected upon delivery.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cartItems.map((item) => {
                const priceFormatted = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: item.products.currency || "MAD",
                }).format(Number(item.products.price));

                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1">
                      {item.products.title} × {item.quantity}
                    </span>
                    <span>{priceFormatted}</span>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(tax)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(total)}
                </span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "PLACE ORDER"}
            </Button>

            <Link href="/app/cart" className="block text-center text-sm text-primary hover:underline">
              ← Back to cart
            </Link>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

