import { createClient } from "@/lib/supabase/server";
import { SearchClient } from "@/components/search/search-client";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { HeaderDesktop } from "@/components/zaha/header-desktop";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  // Initial search if query exists
  let initialProducts: any[] = [];
  if (params.q || params.category) {
    let query = supabase
      .from("products")
      .select(`
        *,
        product_media(media_url, media_type, order_index, is_cover),
        stores!inner(id, name, slug)
      `)
      .eq("status", "active");

    if (params.q) {
      query = query.ilike("title", `%${params.q}%`);
    }

    if (params.category) {
      query = query.eq("category_id", params.category);
    }

    // Sort
    if (params.sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (params.sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else if (params.sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      // Default: promoted first, then by creation date
      query = query.order("is_promoted", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data } = await query.limit(50);
    initialProducts = data || [];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Mobile Header */}
      <div className="md:hidden border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/app">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Search</h1>
            <Link href="/app/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block pt-[114px]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchClient
              initialProducts={initialProducts}
              categories={categories || []}
              initialQuery={params.q || ""}
              initialCategory={params.category || ""}
              initialSort={params.sort || "recommended"}
            />
          </Suspense>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-6">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchClient
              initialProducts={initialProducts}
              categories={categories || []}
              initialQuery={params.q || ""}
              initialCategory={params.category || ""}
              initialSort={params.sort || "recommended"}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

