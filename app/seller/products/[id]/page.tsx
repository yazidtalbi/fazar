import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PromoteProductButton } from "@/components/seller/promote-product-button";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
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

  // Get product and verify ownership
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_media(*),
      categories(id, name, slug)
    `)
    .eq("id", id)
    .eq("store_id", store.id)
    .single();

  if (error || !product) {
    notFound();
  }

  const media = product.product_media.sort((a: any, b: any) => a.order_index - b.order_index);
  const coverMedia = media.find((m: any) => m.is_cover) || media[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/seller/products" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Product Details</h1>
            <Link href={`/seller/products/${id}/edit`}>
              <Button>Edit Product</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Media */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-muted">
              {coverMedia?.media_url ? (
                <Image
                  src={coverMedia.media_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {media.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {media.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="relative aspect-square bg-muted">
                    <Image
                      src={item.media_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{product.title}</CardTitle>
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "draft"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {product.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.currency || "MAD",
                    }).format(Number(product.price))}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div>{product.categories?.name || "Uncategorized"}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Condition</div>
                  <div className="capitalize">{product.condition}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Days to Craft</div>
                  <div>{product.days_to_craft} {product.days_to_craft === 1 ? "day" : "days"}</div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  {product.is_promoted && (
                    <Badge variant="default">Promoted</Badge>
                  )}
                  {product.is_trending && (
                    <Badge variant="secondary">Trending</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/p/${product.id}`} target="_blank">
                  <Button variant="outline" className="w-full">
                    View Public Page
                  </Button>
                </Link>
                <Link href={`/seller/products/${id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Product
                  </Button>
                </Link>
                <PromoteProductButton productId={product.id} isPromoted={product.is_promoted} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

