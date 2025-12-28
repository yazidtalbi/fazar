import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountProvider } from "@/components/account-provider";
import { loadAccountContext } from "@/lib/server/account/load-account";
import { Header } from "@/components/zaha/header";
import { BottomNav } from "@/components/zaha/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const account = await loadAccountContext(user.id);

  return (
    <AccountProvider account={account}>
      <Header />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </AccountProvider>
  );
}

