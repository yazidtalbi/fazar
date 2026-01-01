import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { ArrowLeft, ShoppingCart, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/zaha/product-card";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; price?: string; color?: string; material?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  let query = supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active")
    .eq("category_id", category.id);

  // Sort
  if (search.sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (search.sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else if (search.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("is_promoted", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data: products } = await query.limit(50);

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
      <div className="hidden md:block h-[169px]"></div>

      {/* Breadcrumbs - Desktop */}
      <div className="hidden md:block border-t border-b bg-white">
        <div className="max-w-[100rem] mx-auto px-12 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/app" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b bg-background sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <Link href="/app">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold uppercase">{category.name}</h1>
              {category.description && (
                <p className="text-sm text-primary italic">{category.description}</p>
              )}
            </div>
            <Link href="/app/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter/Sort Bar - Mobile */}
      <div className="md:hidden border-b bg-background sticky top-14 z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-12 overflow-x-auto">
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              SORT
            </Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              PRICE
            </Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              COLOR
            </Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              MATERIAL
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {products && products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold hidden md:block">{category.name}</h2>
              <span className="text-sm text-muted-foreground">{products.length} items</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline">VIEW MORE PRODUCTS</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category</p>
          </div>
        )}
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
