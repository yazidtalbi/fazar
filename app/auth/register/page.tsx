import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-[100rem] mx-auto px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/icon.png"
                alt="Afus"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <span className="text-2xl font-bold text-[#d73502]">Afus</span>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 px-6 py-2">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form - Centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}


