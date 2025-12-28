import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
      stock_quantity,
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
      <div className="container mx-auto px-4 py-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsWithCover.map((product: any) => (
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
                  <CardContent className="p-4">
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
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                        }).format(Number(product.price))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock_quantity} in stock
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
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
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

