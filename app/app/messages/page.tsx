import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { Footer } from "@/components/zaha/footer";
import { MessagesClient } from "@/components/zaha/messages-client";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderDesktop />
      <div className="hidden md:block h-[114px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <MessagesClient />
      </div>

      <Footer />
    </div>
  );
}

