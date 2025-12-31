"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCollectionSelector } from "@/components/seller/product-collection-selector";
import { PromoteProductDialog } from "@/components/seller/promote-product-dialog";
import { Sparkles } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  is_promoted: boolean;
  is_trending: boolean;
  cover_media: string | null;
}

interface ProductsListClientProps {
  products: Product[];
  storeId: string;
}

export function ProductsListClient({ products, storeId }: ProductsListClientProps): React.ReactElement {
  const [balance, setBalance] = useState<number | null>(null);
  const [promoteProductId, setPromoteProductId] = useState<string | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/seller/products/${product.id}`}>
              <div className="relative aspect-square w-full bg-muted">
                {product.cover_media && (
                  <Image
                    src={product.cover_media}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/seller/products/${product.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-2 flex-1">{product.title}</h3>
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "draft"
                        ? "outline"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(product.price))}
                  </span>
                </div>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  {product.is_promoted && (
                    <Badge variant="default" className="text-xs">
                      Promoted
                    </Badge>
                  )}
                  {product.is_trending && (
                    <Badge variant="secondary" className="text-xs">
                      Trending
                    </Badge>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ProductCollectionSelector productId={product.id} storeId={storeId} />
                </div>
              </div>
              {!product.is_promoted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPromoteProductId(product.id);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Promote
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {promoteProductId && balance !== null && (
        <PromoteProductDialog
          open={true}
          onOpenChange={(open) => !open && setPromoteProductId(null)}
          productId={promoteProductId}
          currentBalance={balance}
        />
      )}
    </>
  );
}

