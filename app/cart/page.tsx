import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { GuestCartContent } from "@/components/zaha/guest-cart-content";

export default async function GuestCartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, redirect to /app/cart
  if (user) {
    redirect("/app/cart");
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderDesktop />
      {/* Spacer for desktop header */}
      <div className="hidden md:block h-[169px]"></div>
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
        <GuestCartContent />
      </div>
    </div>
  );
}

