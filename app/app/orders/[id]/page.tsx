import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Query order using RPC function to avoid RLS recursion
  const { data: orderData, error } = await supabase.rpc("get_order_by_id", {
    p_order_id: id,
  });

  if (error || !orderData || orderData.length === 0) {
    console.error("Order query error:", error);
    notFound();
  }

  const order = orderData[0];

  // Query order items using RPC function to avoid RLS issues
  const { data: orderItemsData, error: itemsError } = await supabase.rpc("get_order_items", {
    p_order_id: order.id,
  });

  console.log("Order items RPC result:", {
    data: orderItemsData,
    error: itemsError,
    dataLength: orderItemsData?.length || 0,
  });

  if (itemsError) {
    console.error("Order items query error:", {
      message: itemsError.message,
      details: itemsError.details,
      hint: itemsError.hint,
      code: itemsError.code,
      error: itemsError,
    });
  }

  // If RPC fails, try direct query as fallback (might hit RLS but worth trying)
  let orderItems: any[] = [];
  if (orderItemsData && orderItemsData.length > 0) {
    // Transform the RPC result to match the expected structure
    orderItems = orderItemsData.map((item: any) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
    created_at: item.created_at,
    products: {
      id: item.product_id,
      title: item.product_title,
      product_media: item.product_media_url ? [{
        media_url: item.product_media_url,
        is_cover: true,
        order_index: 0,
      }] : [],
    },
  }));
  } else if (!itemsError) {
    // If no error but no data, try direct query as fallback
    console.log("RPC returned no data, trying direct query...");
    const { data: directItems, error: directError } = await supabase
      .from("order_items")
      .select(`
        *,
        products(
          id,
          title,
          product_media(media_url, is_cover, order_index)
        )
      `)
      .eq("order_id", order.id);
    
    console.log("Direct query result:", { data: directItems, error: directError });
    
    if (directItems && !directError) {
      orderItems = directItems.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        created_at: item.created_at,
        products: item.products || {
          id: item.product_id,
          title: "Unknown Product",
          product_media: [],
        },
      }));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/app/orders" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems?.map((item: any) => {
                  const product = item.products;
                  const coverMedia = product?.product_media?.find((m: any) => m.is_cover) || product?.product_media?.[0];
                  
                  return (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        {coverMedia?.media_url && (
                          <div className="relative w-20 h-20 bg-muted flex-shrink-0">
                            <Image
                              src={coverMedia.media_url}
                              alt={product?.title || "Product"}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/p/${product?.id}`}>
                            <h3 className="font-semibold hover:text-primary line-clamp-2">
                              {product?.title || "Product"}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </span>
                            <span className="font-bold">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MAD",
                              }).format(Number(item.price_at_purchase) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {order.shipping_address}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">Shipping Method</div>
                  <div className="text-sm text-muted-foreground">{order.shipping_method}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">Payment Method</div>
                  <div className="text-sm text-muted-foreground">
                    Cash on Delivery (COD)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(order.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(order.shipping_cost))}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(order.tax))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(order.total))}
                  </span>
                </div>
                <Separator />
                <div className="pt-2">
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "default"
                        : order.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                    className="w-full justify-center"
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Ordered on {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

