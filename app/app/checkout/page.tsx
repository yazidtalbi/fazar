import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/zaha/checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get cart items count
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    redirect("/app");
  }

  const { count } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user.id);

  if (!count || count === 0) {
    redirect("/app/cart");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}

