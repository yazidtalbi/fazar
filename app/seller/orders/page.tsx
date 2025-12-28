import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { UpdateOrderStatusButton } from "@/components/seller/update-order-status-button";

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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {ordersList.length > 0 ? (
          <div className="space-y-4">
            {ordersList.map((order) => (
              <OrderCard key={order.id} order={order} storeId={store.id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

async function OrderCard({ order, storeId }: { order: any; storeId: string }) {
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/seller/orders/${order.id}`}>
              <div className="font-semibold mb-1 hover:text-primary cursor-pointer">
                {order.order_number}
              </div>
            </Link>
            <div className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <Badge
            variant={
              order.status === "delivered"
                ? "default"
                : order.status === "cancelled"
                ? "destructive"
                : "secondary"
            }
          >
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          {storeItems.map((item: any) => {
            return (
              <div key={item.id} className="flex gap-4">
                {item.product_media_url && (
                  <div className="relative w-16 h-16 bg-muted flex-shrink-0">
                    <Image
                      src={item.product_media_url}
                      alt={item.product_title || "Product"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/p/${item.product_id}`}>
                    <h3 className="font-medium hover:text-primary line-clamp-1">
                      {item.product_title || "Product"}
                    </h3>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "MAD",
                    }).format(Number(item.price_at_purchase))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="font-bold text-lg">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MAD",
              }).format(itemsTotal)}
            </div>
          </div>
          <UpdateOrderStatusButton orderId={order.id} currentStatus={order.status} />
        </div>
      </CardContent>
    </Card>
  );
}

