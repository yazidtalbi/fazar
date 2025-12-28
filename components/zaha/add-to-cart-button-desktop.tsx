"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonDesktopProps {
  productId: string;
}

export function AddToCartButtonDesktop({ productId }: AddToCartButtonDesktopProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Check if product is saved on mount
  useEffect(() => {
    async function checkSaved() {
      try {
        const response = await fetch("/api/saved");
        if (response.ok) {
          const data = await response.json();
          const savedItems = data.savedItems || [];
          const saved = savedItems.some((item: any) => item.product_id === productId);
          setIsSaved(saved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    }
    checkSaved();
  }, [productId]);

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

      router.refresh();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
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

      setIsSaved(!isSaved);
      
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
        className="flex-1 bg-[#222222] hover:bg-[#333333] text-white h-12 text-base font-medium btn-scoop"
        style={{
          cornerShape: 'scoop',
          borderRadius: '8px',
        } as React.CSSProperties}
      >
        {isLoading ? "Adding..." : "Add to cart"}
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving}
        size="lg"
        variant="ghost"
        className="h-12 w-12 bg-gray-100 hover:bg-gray-200 p-0 flex-shrink-0"
        style={{
          borderRadius: '8px',
        } as React.CSSProperties}
        aria-label={isSaved ? "Remove from saved" : "Save product"}
      >
        <Heart 
          className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}`} 
        />
      </Button>
    </div>
  );
}

