import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModeSelection } from "@/components/onboarding/mode-selection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

export default async function ModeSelectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">OFUS</h1>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Welcome to Ofus</h1>
          <p className="text-muted-foreground">Choose your path to begin your journey</p>
        </div>
        <ModeSelection />
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

