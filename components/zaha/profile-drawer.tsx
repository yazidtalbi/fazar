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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  ShoppingBag, 
  Store, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  ChevronRight,
  Mail,
  Clock
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [store, setStore] = useState<{ slug: string } | null>(null);
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

      const { data: buyer } = await supabase
        .from("buyer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setBuyerProfile(buyer);

      const { data: seller } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setSellerProfile(seller);

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
    router.push("/");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0 border-none shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader variant="premium" />
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white">
            <div className="px-8 pt-12 pb-8 bg-neutral-50 border-b border-neutral-100">
              <SheetHeader className="text-left space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-white shadow-xl shadow-neutral-200 border border-neutral-100 flex items-center justify-center mb-2">
                  <User className="h-8 w-8 text-neutral-900" />
                </div>
                <div>
                  <SheetTitle className="text-3xl font-bold tracking-tight text-neutral-900">Account</SheetTitle>
                  <SheetDescription className="text-neutral-500 text-base mt-1">
                    Manage your profile and store settings.
                  </SheetDescription>
                </div>
              </SheetHeader>

              <div className="mt-8 flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 leading-none mb-1">Email Address</span>
                  <span className="text-sm font-semibold text-neutral-900 truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 py-8 space-y-10">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Activity</h3>
                <div className="grid gap-2">
                  <Link href="/orders" onClick={() => onOpenChange(false)} className="group block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-transparent group-hover:bg-neutral-100 group-hover:border-neutral-200 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-neutral-900">My Orders</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>

                  <Link href="/cart" onClick={() => onOpenChange(false)} className="group block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-transparent group-hover:bg-neutral-100 group-hover:border-neutral-200 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-neutral-900">Shopping Cart</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Merchant Tools</h3>
                  {sellerProfile?.is_verified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Verified Seller</span>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Link href="/seller" onClick={() => onOpenChange(false)} className="group block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary">
                          <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-neutral-900">Seller Dashboard</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>

                  {store && (
                    <Link href={`/store/${store.slug}`} onClick={() => onOpenChange(false)} className="group block">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-transparent group-hover:bg-neutral-100 group-hover:border-neutral-200 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                            <Store className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-neutral-900">View Public Store</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400 px-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Member since {new Date(buyerProfile?.created_at || user?.created_at).toLocaleDateString()}</span>
                </div>
                <Button 
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full h-14 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

