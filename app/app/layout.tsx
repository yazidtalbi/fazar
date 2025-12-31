import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountProvider } from "@/components/account-provider";
import { loadAccountContext } from "@/lib/server/account/load-account";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
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
      <HeaderDesktop />
      {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
      <div className="hidden md:block h-[169px]"></div>
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </AccountProvider>
  );
}

