"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfileData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        onOpenChange(false);
        return;
      }

      setUser(user);

      // Fetch buyer profile
      const { data: buyer } = await supabase
        .from("buyer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setBuyerProfile(buyer);

      // Fetch seller profile
      const { data: seller } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setSellerProfile(seller);

      // Fetch store if seller profile exists
      if (seller) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("slug")
          .eq("seller_id", user.id)
          .single();

        setStore(storeData);
      }

      setLoading(false);
    }

    if (open) {
      fetchProfileData();
    }
  }, [open, onOpenChange]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>Your account information and settings</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-lg">{user?.email}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                  <div className="text-sm font-mono break-all">{user?.id}</div>
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
                        <Link 
                          href={`/store/${store.slug}`} 
                          className="text-sm text-primary hover:underline"
                          onClick={() => onOpenChange(false)}
                        >
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

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/seller" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Seller Dashboard
                  </Button>
                </Link>
                <Link href="/app/orders" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    My Orders
                  </Button>
                </Link>
                <Link href="/app/cart" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Shopping Cart
                  </Button>
                </Link>
                <Separator />
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

