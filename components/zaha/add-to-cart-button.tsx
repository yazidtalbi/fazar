"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  stockQuantity: number;
}

export function AddToCartButton({ productId, stockQuantity }: AddToCartButtonProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  async function handleAddToCart() {
    if (quantity < 1 || quantity > stockQuantity) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="quantity" className="text-sm">Quantity:</label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={stockQuantity}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20 h-10 border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button
        className="flex-1"
        onClick={handleAddToCart}
        disabled={isLoading || stockQuantity === 0}
      >
        {isLoading ? "Adding..." : stockQuantity === 0 ? "Out of Stock" : "ADD TO BASKET"}
      </Button>
    </div>
  );
}

