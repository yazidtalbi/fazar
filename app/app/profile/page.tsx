import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: store } = sellerProfile
    ? await supabase
        .from("stores")
        .select("slug")
        .eq("seller_id", user.id)
        .single()
    : { data: null };

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  // Get order stats
  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, status, total")
    .eq("buyer_id", user.id);

  const orders = ordersData || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  // Get saved items count
  const { data: savedItems } = await supabase
    .from("saved_items")
    .select("id")
    .eq("buyer_id", user.id);

  const savedCount = savedItems?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <HeaderDesktop />
      
      {/* Spacer for desktop header */}
      <div className="hidden md:block h-[169px]"></div>

      <div className="max-w-[100rem] mx-auto px-12 py-6 md:py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="text-lg font-semibold">{user.email}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Member Since</div>
                <div className="text-sm">
                  {buyerProfile 
                    ? new Date(buyerProfile.created_at).toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })
                    : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Orders</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Spent</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(totalSpent)}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Saved Items</div>
                <div className="text-2xl font-bold">{savedCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Buyer Profile</div>
                {buyerProfile ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <div className="text-sm text-muted-foreground">Not set up</div>
                )}
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Seller Profile</div>
                {sellerProfile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={sellerProfile.is_verified ? "default" : "outline"}>
                        {sellerProfile.is_verified ? "Verified" : "Active"}
                      </Badge>
                    </div>
                    {store && (
                      <Link href={`/store/${store.slug}`} className="text-sm text-primary hover:underline block">
                        View Store →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not set up</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/app/orders">
                <Button variant="outline" className="w-full justify-start">
                  My Orders
                </Button>
              </Link>
              <Link href="/app/cart">
                <Button variant="outline" className="w-full justify-start">
                  Shopping Cart
                </Button>
              </Link>
                <Link href="/app/saved">
                  <Button variant="outline" className="w-full justify-start">
                    Saved Items
                  </Button>
                </Link>
                {sellerProfile && (
                  <Link href="/seller">
                    <Button variant="outline" className="w-full justify-start">
                      Seller Dashboard
                    </Button>
                  </Link>
                )}
              </div>
              <Separator className="my-4" />
              <form action={handleSignOut}>
                <Button type="submit" variant="destructive" className="w-full">
                  Sign Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block mt-16">
        <Footer />
      </div>
    </div>
  );
}

