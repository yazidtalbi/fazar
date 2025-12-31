import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreditsPurchaseClient } from "@/components/seller/credits-purchase-client";

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Purchase Credits</h1>
        <CreditsPurchaseClient />
      </div>
    </div>
  );
}

