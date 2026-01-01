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
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-0 md:py-8">
        <div className="pt-2 md:pt-0">
          <CartContent />
        </div>
      </div>
    </div>
  );
}

