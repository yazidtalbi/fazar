import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountProvider } from "@/components/account-provider";
import { loadAccountContext } from "@/lib/server/account/load-account";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { SellerNav } from "@/components/seller/seller-nav";

export default async function SellerLayout({
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
      <SellerNav />
      <div className="flex">
        {/* Desktop: Vertical sidebar is part of SellerNav */}
        <div className="hidden md:block w-64 flex-shrink-0"></div>
        {/* Content area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AccountProvider>
  );
}

