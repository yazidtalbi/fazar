"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSavedItems } from "@/components/saved-items-provider";

interface AddToCartButtonDesktopProps {
  productId: string;
}

export function AddToCartButtonDesktop({ productId }: AddToCartButtonDesktopProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const { savedItems, refreshSavedItems } = useSavedItems();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Compute isSaved from savedItems
  const isSaved = useMemo(() => {
    return savedItems.some((item: any) => item.product_id === productId);
  }, [savedItems, productId]);

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
          quantity: 1,
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

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = isSaved 
        ? `/api/saved?productId=${productId}` 
        : "/api/saved";
      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: isSaved ? undefined : JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      // Refresh saved items in context to update all components
      await refreshSavedItems();
      
      if (!isSaved) {
        toast.success("Product added to saved items");
      } else {
        toast.success("Product removed from saved items");
      }
      
      router.refresh();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleAddToCart}
        disabled={isLoading}
        size="lg" 
        className="flex-1 bg-[#371837] hover:bg-[#371837]/90 text-white h-12 text-base font-medium rounded-full"
      >
        {isLoading ? "Adding..." : "Add to cart"}
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving}
        size="lg"
        variant="ghost"
        className="h-12 w-12 bg-gray-100 hover:bg-gray-200 p-0 flex-shrink-0"
        aria-label={isSaved ? "Remove from saved" : "Save product"}
      >
        <Heart 
          className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}`} 
        />
      </Button>
    </div>
  );
}

