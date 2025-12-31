"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PromoteProductDialog } from "@/components/seller/promote-product-dialog";
import { Sparkles } from "lucide-react";

interface PromoteProductButtonProps {
  productId: string;
  isPromoted: boolean;
}

export function PromoteProductButton({ productId, isPromoted }: PromoteProductButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/credits/balance");
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch credits balance:", error);
      }
    }

    fetchBalance();

    const handleCreditsUpdate = () => {
      fetchBalance();
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);
    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, []);

  if (isPromoted) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Promote Product
      </Button>
      {balance !== null && (
        <PromoteProductDialog
          open={open}
          onOpenChange={setOpen}
          productId={productId}
          currentBalance={balance}
        />
      )}
    </>
  );
}

