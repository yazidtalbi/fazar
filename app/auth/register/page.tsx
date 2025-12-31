import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            <Link href="/welcome">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold">ANDALUS</h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Decorative Image */}
      <div className="relative h-32 w-full bg-gradient-to-r from-primary/10 to-primary/5">
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary" />
            <h2 className="text-2xl font-bold">Marhaba</h2>
          </div>
          <p className="text-sm text-muted-foreground">Enter your details to join the souk.</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

