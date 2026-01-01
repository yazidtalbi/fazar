"use client";

import { useState, useEffect } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/zaha/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, History, ArrowUpRight, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      {/* Mobile Search Bar */}
      <form onSubmit={handleSearchSubmit} className="md:hidden flex gap-2 items-center">
        <Link href="/app" className="flex-shrink-0">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
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

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Filter Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {}}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Afficher les filtres
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Articles physiques
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Pays d'expédition : FR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Moins de 20 €
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Top vendeur
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Vintage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    En promo
                  </Button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Categories</h3>
                <div className="space-y-1">
                  <Button
                    variant={!searchQuery.category ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setSearchQuery({ category: "" })}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={searchQuery.category === cat.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setSearchQuery({ category: cat.id })}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {products.length > 0 ? (
                  <>+ de {products.length} articles et des annonces</>
                ) : (
                  <>Aucun résultat</>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trier par:</span>
                <select
                  value={searchQuery.sort || "recommended"}
                  onChange={(e) => setSearchQuery({ sort: e.target.value })}
                  className="px-3 py-1.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:border-primary"
                >
                  <option value="recommended">Le plus pertinent</option>
                  <option value="price-asc">Prix: croissant</option>
                  <option value="price-desc">Prix: décroissant</option>
                  <option value="newest">Plus récent</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-12">Recherche en cours...</div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Essayez d'ajuster votre recherche ou vos filtres
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Category Filters */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2">
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

      {/* Mobile Recommended for You / Results */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="text-center py-12">Recherche en cours...</div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recommandé pour vous</h3>
            <div className="grid grid-cols-2 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
              <p className="text-sm text-muted-foreground mt-2">
                Essayez d'ajuster votre recherche ou vos filtres
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

