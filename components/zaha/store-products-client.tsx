"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/zaha/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  is_promoted: boolean;
  is_trending: boolean;
  is_featured?: boolean;
  days_to_craft: number;
  created_at?: string;
  product_media: Array<{
    media_url: string;
    media_type: string;
    order_index: number;
    is_cover: boolean;
  }>;
  cover_media?: string | null;
}

interface StoreProductsClientProps {
  products: Product[];
  collections?: Array<{
    id: string;
    collection_products?: Array<{
      product_id: string;
    }>;
  }>;
}

type SortOption = "featured" | "newest" | "price_high" | "price_low";

export function StoreProductsClient({ products, collections = [] }: StoreProductsClientProps): React.ReactElement {
  const searchParams = useSearchParams();
  const selectedCollection = searchParams.get("collection");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Reset to page 1 when collection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCollection]);

  // Filter products by collection if selected
  const filteredProducts = useMemo(() => {
    if (!selectedCollection) return products;
    
    const collection = collections.find(c => c.id === selectedCollection);
    if (!collection) return products;

    const collectionProductIds = new Set(
      (collection.collection_products || []).map((cp: any) => cp.product_id)
    );
    
    return products.filter(p => collectionProductIds.has(p.id));
  }, [products, collections, selectedCollection]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case "featured":
        // Featured items first, then by creation date (newest first)
        return sorted.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          // If both featured or both not featured, sort by created_at descending
          if (!a.created_at && !b.created_at) return 0;
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      case "newest":
        // Sort by created_at descending (newest first)
        return sorted.sort((a, b) => {
          if (!a.created_at && !b.created_at) return 0;
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      case "price_high":
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case "price_low":
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Shop</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{filteredProducts.length} items</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_high">Most Expensive</option>
            <option value="price_low">Least Expensive</option>
          </select>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
            {paginatedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

