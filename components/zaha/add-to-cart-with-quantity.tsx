"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/zaha/quantity-selector";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartWithQuantityProps {
  productId: string;
  className?: string;
}

export function AddToCartWithQuantity({ productId, className }: AddToCartWithQuantityProps): React.ReactElement {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAddToCart() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success("Item added to cart");
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      // Redirect to cart page
      router.push("/app/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-4 w-full", className)}>
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        className="w-32"
      />
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="flex-1"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        ADD TO BASKET
      </Button>
    </div>
  );
}

