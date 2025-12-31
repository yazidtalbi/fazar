import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductsListClient } from "@/components/seller/products-list-client";

export default async function SellerProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      status,
      is_promoted,
      is_trending,
      product_media!inner(media_url, is_cover, order_index)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const productsWithCover = (products || []).map((product: any) => {
    const media = product.product_media as Array<{
      media_url: string;
      is_cover: boolean;
      order_index: number;
    }>;
    const coverMedia = media.find((m) => m.is_cover) || media[0];
    return {
      ...product,
      cover_media: coverMedia?.media_url || null,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Inventory</h1>
          <Link href="/seller/products/new">
            <Button>+ Add Product</Button>
          </Link>
        </div>

        {productsWithCover.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Link href="/seller/products/new">
                <Button>Create Your First Product</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ProductsListClient products={productsWithCover} storeId={store.id} />
        )}
      </div>
    </div>
  );
}

