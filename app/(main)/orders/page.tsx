import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecentOrders } from "@/components/zaha/recent-orders";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-0 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 mt-4 md:mt-0">My Orders</h1>

        <RecentOrders limit={20} showReviewButton={true} />
      </div>
    </div>
  );
}

