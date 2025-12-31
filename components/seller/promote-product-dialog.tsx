"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PromoteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currentBalance: number;
}

export function PromoteProductDialog({
  open,
  onOpenChange,
  productId,
  currentBalance,
}: PromoteProductDialogProps): React.ReactElement {
  const router = useRouter();
  const [days, setDays] = useState(7);
  const [pricePerDay, setPricePerDay] = useState(10);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch("/api/promotion/pricing");
        if (response.ok) {
          const data = await response.json();
          if (data.pricePerDay) {
            setPricePerDay(data.pricePerDay);
            setMinDays(data.minDays || 1);
            setMaxDays(data.maxDays || 30);
            setDays(Math.max(data.minDays || 7, 7));
          }
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      } finally {
        setIsLoadingPricing(false);
      }
    }

    if (open) {
      fetchPricing();
    }
  }, [open]);

  const totalCost = days * pricePerDay;
  const canAfford = currentBalance >= totalCost;

  async function handlePromote() {
    if (days < minDays || days > maxDays) {
      toast.error(`Please enter a duration between ${minDays} and ${maxDays} days`);
      return;
    }

    if (!canAfford) {
      toast.error("Insufficient credits. Please purchase more credits.");
      onOpenChange(false);
      router.push("/seller/credits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to promote product");
      }

      toast.success(`Product promoted for ${days} day(s)!`);
      onOpenChange(false);
      router.refresh();
      // Dispatch event to update credits balance
      window.dispatchEvent(new CustomEvent("creditsUpdated"));
    } catch (error: any) {
      console.error("Error promoting product:", error);
      toast.error(error.message || "Failed to promote product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Product</DialogTitle>
          <DialogDescription>
            Boost your product visibility by promoting it. Your product will be featured prominently in search results and category pages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="days">Promotion Duration (days)</Label>
            <Input
              id="days"
              type="number"
              min={minDays}
              max={maxDays}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || minDays)}
              disabled={isLoadingPricing || isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {minDays} day(s), Maximum: {maxDays} day(s)
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per day</span>
              <span className="font-medium">{pricePerDay.toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{days} day(s)</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Cost</span>
                <span className={!canAfford ? "text-red-500" : ""}>
                  {totalCost.toFixed(2)} MAD
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Credits Balance</span>
              <span className="font-medium">{currentBalance.toFixed(2)} MAD</span>
            </div>
            {!canAfford && (
              <p className="text-xs text-red-500 mt-2">
                Insufficient credits. You need {totalCost.toFixed(2)} MAD but only have {currentBalance.toFixed(2)} MAD.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={!canAfford || isLoading || isLoadingPricing}>
            {isLoading ? "Promoting..." : `Promote for ${totalCost.toFixed(2)} MAD`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

