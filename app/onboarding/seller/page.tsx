import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SellerOnboardingForm } from "@/components/onboarding/seller-onboarding-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function SellerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if seller profile exists
  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!sellerProfile) {
    // Create seller profile if it doesn't exist
    await supabase.from("seller_profiles").insert({ id: user.id });
  }

  // Check if store already exists
  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("seller_id", user.id)
    .single();

  if (store) {
    redirect(`/seller`);
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="mb-8">
          <Link href="/app" className="inline-block mb-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Seller Onboarding</h1>
          <p className="text-muted-foreground">STEP 1 OF 2</p>
        </div>
        <SellerOnboardingForm />
      </div>
    </div>
  );
}

