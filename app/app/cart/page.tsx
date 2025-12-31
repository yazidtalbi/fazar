import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CartContent } from "@/components/zaha/cart-content";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get or create buyer profile
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    await supabase.from("buyer_profiles").insert({ id: user.id });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
        <CartContent />
      </div>
    </div>
  );
}

