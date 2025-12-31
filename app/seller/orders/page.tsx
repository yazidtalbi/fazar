import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { UpdateOrderStatusButton } from "@/components/seller/update-order-status-button";
import { Database } from "@/lib/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export default async function SellerOrdersPage() {
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

  // Get orders using RPC function (bypasses RLS issues)
  const { data: orders, error: ordersError } = await supabase
    .rpc("get_seller_orders");

  if (ordersError) {
    console.error("Error fetching seller orders:", ordersError);
  }

  const ordersList = orders || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        {ordersList.length > 0 ? (
          <div className="space-y-6">
            {ordersList.map((order: Order) => (
              <OrderCard key={order.id} order={order} storeId={store.id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Orders from your store will appear here once customers make purchases.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

async function OrderCard({ order, storeId }: { order: Order; storeId: string }) {
  const supabase = await createClient();

  // Get order items for this seller's products using RPC function
  const { data: orderItems, error: orderItemsError } = await supabase
    .rpc("get_seller_order_items", { p_order_id: order.id });

  if (orderItemsError) {
    console.error("Error fetching seller order items:", orderItemsError);
  }

  const storeItems = orderItems || [];

  if (storeItems.length === 0) return null;

  const itemsTotal = storeItems.reduce((sum: number, item: any) => {
    return sum + Number(item.price_at_purchase) * item.quantity;
  }, 0);

  const orderDate = new Date(order.created_at);

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="md:col-span-2 space-y-4">
            {/* Order Header */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div>
                <Link href={`/seller/orders/${order.id}`}>
                  <h2 className="text-lg font-semibold hover:text-primary cursor-pointer mb-1">
                    Order {order.order_number}
                  </h2>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {orderDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge
                variant={
                  order.status === "delivered"
                    ? "default"
                    : order.status === "cancelled"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs"
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {storeItems.map((item: any) => {
                const itemPrice = Number(item.price_at_purchase);
                const itemTotal = itemPrice * item.quantity;
                const priceFormatted = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "MAD",
                }).format(itemPrice);

                return (
                  <div key={item.id} className="flex gap-4">
                    <Link href={`/p/${item.product_id}`} className="flex-shrink-0">
                      <div className="relative w-24 h-24 bg-muted rounded">
                        {item.product_media_url ? (
                          <Image
                            src={item.product_media_url}
                            alt={item.product_title || "Product"}
                            fill
                            className="object-cover rounded"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/p/${item.product_id}`}>
                        <h3 className="font-semibold mb-1 hover:text-primary line-clamp-2">
                          {item.product_title || "Product"}
                        </h3>
                      </Link>
                      <div className="text-sm text-muted-foreground mb-2">
                        Quantity: {item.quantity}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "MAD",
                          }).format(itemTotal)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {priceFormatted} each
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="border border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "MAD",
                      }).format(itemsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "MAD",
                      }).format(Number(order.shipping_cost || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax</span>
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "MAD",
                      }).format(Number(order.tax || 0))}
                    </span>
                  </div>
                  <Separator className="my-3" />
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

                <div className="pt-4 border-t">
                  <UpdateOrderStatusButton orderId={order.id} currentStatus={order.status} />
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link href={`/seller/orders/${order.id}`}>
                    <Button variant="outline" className="w-full">
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
