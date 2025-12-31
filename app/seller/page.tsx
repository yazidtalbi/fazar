import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { CreditsBalance } from "@/components/seller/credits-balance";

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if store exists
  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  // Get basic stats
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  // Get orders using RPC function (bypasses RLS issues)
  const { data: allOrders, error: ordersError } = await supabase
    .rpc("get_seller_orders");

  if (ordersError) {
    console.error("Error fetching seller orders:", ordersError);
  }

  const orderCount = allOrders?.length || 0;
  const recentOrders = allOrders?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Salam, {user.email}</p>
            </div>
            <Link href="/app">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Back to App</span>
                <span className="md:hidden">App</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Credits Balance */}
        <div className="mb-6">
          <CreditsBalance />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{store.name}</div>
              <Link href="/seller/store" className="text-xs text-primary hover:underline">
                Edit store
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/seller/products/new">
              <Button>Add Product</Button>
            </Link>
            <Link href="/seller/products">
              <Button variant="outline">View Products</Button>
            </Link>
            <Link href="/seller/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            <Link href="/seller/store">
              <Button variant="outline">Store Settings</Button>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/seller/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "MAD",
                          }).format(Number(order.total))}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}

