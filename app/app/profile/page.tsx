import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="text-lg">{user.email}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">User ID</div>
                <div className="text-sm font-mono">{user.id}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Buyer Profile</div>
                {buyerProfile ? (
                  <div className="text-sm text-muted-foreground">
                    Active since {new Date(buyerProfile.created_at).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not set up</div>
                )}
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Seller Profile</div>
                {sellerProfile ? (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {sellerProfile.is_verified && (
                        <span className="inline-block mr-2 px-2 py-1 text-xs border border-primary text-primary">
                          Verified
                        </span>
                      )}
                      Active since {new Date(sellerProfile.created_at).toLocaleDateString()}
                    </div>
                    {store && (
                      <Link href={`/store/${store.slug}`} className="text-sm text-primary hover:underline">
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

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/seller">
                <Button variant="outline" className="w-full justify-start">
                  Seller Dashboard
                </Button>
              </Link>
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
              <Separator />
              <form action={handleSignOut}>
                <Button type="submit" variant="destructive" className="w-full">
                  Sign Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

