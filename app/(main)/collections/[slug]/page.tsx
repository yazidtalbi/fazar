import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { ProductCard } from "@/components/zaha/product-card";
import Image from "next/image";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch collection data
  const { data: collection } = await supabase
    .from("global_collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!collection) {
    notFound();
  }

  // Fetch products in this collection
  const { data: collectionProducts } = await supabase
    .from("global_collection_products")
    .select(`
      order_index,
      products (
        *,
        product_media(media_url, media_type, order_index, is_cover),
        stores!inner(id, name, slug)
      )
    `)
    .eq("global_collection_id", collection.id)
    .order("order_index", { ascending: true });

  // Transform products
  const products = ((collectionProducts || []) as any[])
    .map((cp: any) => cp.products)
    .filter((p: any) => p && p.status === "active");

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header */}
      <div className="hidden md:block h-[169px]"></div>

      {/* Collection Header */}
      <div className="max-w-[100rem] mx-auto px-12 py-8 md:py-12">
        {collection.cover_image_url && (
          <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
            <Image
              src={collection.cover_image_url}
              alt={collection.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">{collection.description}</p>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block mt-16">
        <Footer />
      </div>
    </div>
  );
}

