import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/zaha/product-card";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get or create buyer profile
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    await supabase.from("buyer_profiles").insert({ id: user.id });
  }

  // Fetch saved items
  const { data: savedItems, error } = await supabase
    .from("saved_items")
    .select(`
      *,
      products(
        id,
        title,
        price,
        currency,
        days_to_craft,
        is_promoted,
        is_trending,
        status,
        product_media(media_url, media_type, order_index, is_cover),
        stores(id, name, slug)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  // Transform saved items to products with cover media (only active products)
  const productsWithCover = ((savedItems || []) as any[])
    .map((item: any) => {
      const product = item.products;
      if (!product || product.status !== "active") return null;
      
      const mediaArray = Array.isArray(product.product_media) ? product.product_media : [];
      const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
      
      return {
        ...product,
        cover_media: coverMedia?.media_url || null,
        product_media: mediaArray,
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
      <div className="hidden md:block h-[169px]"></div>

      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-0 md:py-8">
        <h1 className="text-3xl font-bold mb-6 mt-4 md:mt-0">Saved Items</h1>
        
        {productsWithCover.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No saved items yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productsWithCover.map((product: any) => (
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

