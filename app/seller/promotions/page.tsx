import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Promotions</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Promotions management coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

