"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  is_promoted: boolean;
  promoted_start_date: string | null;
  promoted_end_date: string | null;
  cover_media: string | null;
}

interface Pricing {
  price_per_day: number;
  min_days: number;
  max_days: number;
}

interface PromotionsClientProps {
  products: Product[];
  pricing: Pricing;
}

export function PromotionsClient({ products, pricing }: PromotionsClientProps): React.ReactElement {
  const router = useRouter();
  const [extendProductId, setExtendProductId] = useState<string | null>(null);
  const [additionalDays, setAdditionalDays] = useState(pricing.min_days);
  const [isExtending, setIsExtending] = useState(false);
  const [unpromoteProductId, setUnpromoteProductId] = useState<string | null>(null);
  const [isUnpromoting, setIsUnpromoting] = useState(false);

  async function handleExtend() {
    if (!extendProductId) return;

    if (additionalDays < pricing.min_days || additionalDays > pricing.max_days) {
      toast.error(`Please enter a duration between ${pricing.min_days} and ${pricing.max_days} days`);
      return;
    }

    setIsExtending(true);
    try {
      const response = await fetch(`/api/products/${extendProductId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: additionalDays }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extend promotion");
      }

      toast.success(`Promotion extended for ${additionalDays} day(s)!`);
      setExtendProductId(null);
      setAdditionalDays(pricing.min_days);
      router.refresh();
      window.dispatchEvent(new CustomEvent("creditsUpdated"));
    } catch (error: any) {
      console.error("Error extending promotion:", error);
      toast.error(error.message || "Failed to extend promotion");
    } finally {
      setIsExtending(false);
    }
  }

  async function handleUnpromote() {
    if (!unpromoteProductId) return;

    setIsUnpromoting(true);
    try {
      const response = await fetch(`/api/products/${unpromoteProductId}/promote`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unpromote product");
      }

      toast.success("Product unpromoted successfully");
      setUnpromoteProductId(null);
      router.refresh();
    } catch (error: any) {
      console.error("Error unpromoting product:", error);
      toast.error(error.message || "Failed to unpromote product");
    } finally {
      setIsUnpromoting(false);
    }
  }

  function getDaysRemaining(endDate: string | null): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No promoted products yet</p>
          <Link href="/seller/products">
            <Button>Go to Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const daysRemaining = getDaysRemaining(product.promoted_end_date);
          const isExpired = daysRemaining === 0;

          return (
            <Card key={product.id} className="overflow-hidden">
              {product.cover_media && (
                <div className="relative aspect-square w-full bg-muted">
                  <Image
                    src={product.cover_media}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-2 flex-1">{product.title}</h3>
                  <Badge variant={isExpired ? "destructive" : "default"} className="ml-2">
                    {isExpired ? "Expired" : `${daysRemaining}d left`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.currency || "MAD",
                    }).format(Number(product.price))}
                  </span>
                </div>
                {product.promoted_start_date && product.promoted_end_date && (
                  <div className="text-xs text-muted-foreground mb-2">
                    <div>Started: {new Date(product.promoted_start_date).toLocaleDateString()}</div>
                    <div>Ends: {new Date(product.promoted_end_date).toLocaleDateString()}</div>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setExtendProductId(product.id)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setUnpromoteProductId(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Extend Promotion Dialog */}
      <Dialog open={!!extendProductId} onOpenChange={(open) => !open && setExtendProductId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Promotion</DialogTitle>
            <DialogDescription>
              Add more days to extend your product promotion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Additional Days</Label>
              <Input
                id="days"
                type="number"
                min={pricing.min_days}
                max={pricing.max_days}
                value={additionalDays}
                onChange={(e) => setAdditionalDays(parseInt(e.target.value) || pricing.min_days)}
                disabled={isExtending}
              />
              <p className="text-xs text-muted-foreground">
                Minimum: {pricing.min_days} day(s), Maximum: {pricing.max_days} day(s)
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per day</span>
                <span className="font-medium">{pricing.price_per_day.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Additional days</span>
                <span className="font-medium">{additionalDays} day(s)</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Cost</span>
                  <span>{(additionalDays * pricing.price_per_day).toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendProductId(null)} disabled={isExtending}>
              Cancel
            </Button>
            <Button onClick={handleExtend} disabled={isExtending}>
              {isExtending ? "Extending..." : `Extend for ${(additionalDays * pricing.price_per_day).toFixed(2)} MAD`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpromote Confirmation Dialog */}
      <Dialog open={!!unpromoteProductId} onOpenChange={(open) => !open && setUnpromoteProductId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpromote Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop promoting this product? This action cannot be undone and credits will not be refunded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnpromoteProductId(null)} disabled={isUnpromoting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnpromote} disabled={isUnpromoting}>
              {isUnpromoting ? "Unpromoting..." : "Unpromote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

