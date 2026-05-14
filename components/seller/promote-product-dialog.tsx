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
import { Zap, Wallet, Calendar } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

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
      window.dispatchEvent(new CustomEvent("creditsUpdated"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to promote product";
      console.error("Error promoting product:", error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[24px]">
        <div className="px-8 pt-10 pb-6">
          <DialogHeader className="text-left space-y-2 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
              Promote Product
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-base leading-relaxed">
              Boost your visibility and reach more buyers. Your product will be featured in prime spots.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="days" className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                  Duration (days)
                </Label>
                <span className="text-xs font-semibold text-neutral-400">
                  {minDays}-{maxDays} days
                </span>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="days"
                  type="number"
                  min={minDays}
                  max={maxDays}
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || minDays)}
                  disabled={isLoadingPricing || isLoading}
                  className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all h-12 rounded-xl text-lg font-semibold"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-6 space-y-4 border border-neutral-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Price per day</span>
                <span className="font-bold text-neutral-900">{pricePerDay.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Duration</span>
                <span className="font-bold text-neutral-900">{days} day(s)</span>
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-900 font-bold">Total Cost</span>
                  <span className={cn("text-xl font-black", !canAfford ? "text-red-500" : "text-primary")}>
                    {totalCost.toFixed(2)} MAD
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <Wallet className="h-3 w-3" />
                <span>Your Balance: {currentBalance.toFixed(2)} MAD</span>
              </div>

              {!canAfford && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                  Insufficient credits. You need {totalCost.toFixed(2)} MAD.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-neutral-50 border-t border-neutral-100 sm:justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="rounded-xl font-semibold text-neutral-500 hover:text-neutral-900"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePromote} 
            disabled={!canAfford || isLoading || isLoadingPricing}
            className="h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader size={18} className="text-white" />
                <span>Promoting...</span>
              </div>
            ) : `Promote Now`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

