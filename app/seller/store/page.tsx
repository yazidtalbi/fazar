import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/seller/store-settings-form";

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Store Settings</h1>
        <StoreSettingsForm store={store} />
      </div>
    </div>
  );
}

