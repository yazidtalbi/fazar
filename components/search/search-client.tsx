"use client";

import { useState, useEffect } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/zaha/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, History, ArrowUpRight, X } from "lucide-react";
import { SearchFiltersSheet } from "./search-filters-sheet";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchClientProps {
  initialProducts: any[];
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
  initialSort: string;
}

export function SearchClient({
  initialProducts,
  categories,
  initialQuery,
  initialCategory,
  initialSort,
}: SearchClientProps): React.ReactElement {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("recommended"),
    },
    {
      shallow: false,
    }
  );

  useEffect(() => {
    setSearchQuery({ q: initialQuery, category: initialCategory, sort: initialSort });
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchQuery.q, searchQuery.category, searchQuery.sort]);

  async function performSearch() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.q) params.append("q", searchQuery.q);
      if (searchQuery.category) params.append("category", searchQuery.category);
      if (searchQuery.sort) params.append("sort", searchQuery.sort);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch();
  }

  // Mock recent searches - in real app, store in localStorage
  const recentSearches = ["Vintage Beni Ourain", "Taznakht Rug"];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for Kilim, Argan oil..."
            value={searchQuery.q || ""}
            onChange={(e) => setSearchQuery({ q: e.target.value })}
            className="pl-10"
          />
        </div>
        <SearchFiltersSheet
          currentSort={searchQuery.sort || "recommended"}
          onSortChange={(sort) => setSearchQuery({ sort })}
          resultCount={products.length}
        />
      </form>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={!searchQuery.category ? "default" : "outline"}
          size="sm"
          onClick={() => setSearchQuery({ category: "" })}
          className="whitespace-nowrap"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={searchQuery.category === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchQuery({ category: cat.id })}
            className="whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !searchQuery.q && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent Searches</h3>
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => setSearchQuery({ q: search })}
                className="w-full flex items-center justify-between p-2 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended for You / Results */}
      {isLoading ? (
        <div className="text-center py-12">Searching...</div>
      ) : products.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Recommended for You</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

