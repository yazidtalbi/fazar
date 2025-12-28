import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { UpdateOrderStatusButton } from "@/components/seller/update-order-status-button";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerOrderDetailPage({ params }: OrderDetailPageProps) {
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

  // Get order using RPC function for sellers
  const { data: orderData, error: orderError } = await supabase.rpc("get_seller_order_by_id", {
    p_order_id: id,
  });

  if (orderError || !orderData || orderData.length === 0) {
    console.error("Order query error:", orderError);
    notFound();
  }

  const order = orderData[0];

  // Get order items for this seller's products
  const { data: orderItemsData, error: itemsError } = await supabase.rpc("get_seller_order_items", {
    p_order_id: order.id,
  });

  if (itemsError) {
    console.error("Order items query error:", itemsError);
  }

  const orderItems = orderItemsData || [];

  if (orderItems.length === 0) {
    notFound();
  }

  const itemsTotal = orderItems.reduce((sum: number, item: any) => {
    return sum + Number(item.price_at_purchase) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/seller/orders" className="text-sm text-primary hover:underline mb-4 inline-block">
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
                {orderItems.map((item: any) => {
                  return (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        {item.product_media_url && (
                          <div className="relative w-20 h-20 bg-muted flex-shrink-0">
                            <Image
                              src={item.product_media_url}
                              alt={item.product_title || "Product"}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/p/${item.product_id}`}>
                            <h3 className="font-semibold hover:text-primary line-clamp-2">
                              {item.product_title || "Product"}
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
                    {order.payment_method || "Cash on Delivery (COD)"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Buyer ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{order.buyer_id}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
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
                </div>
                <Separator />
                <div>
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "default"
                        : order.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                    className="w-full justify-center mb-4"
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <UpdateOrderStatusButton orderId={order.id} currentStatus={order.status} />
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground text-center">
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

