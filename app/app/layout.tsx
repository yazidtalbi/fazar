import { createClient } from "@/lib/supabase/server";
import { AccountProvider } from "@/components/account-provider";
import { SavedItemsProvider } from "@/components/saved-items-provider";
import { loadAccountContext } from "@/lib/server/account/load-account";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { ConditionalMobileHeader } from "@/components/zaha/conditional-mobile-header";
import { ConditionalMobileHeaderSpacer } from "@/components/zaha/conditional-mobile-header-spacer";
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

  // For guests, render without AccountProvider
  if (!user) {
    return (
      <SavedItemsProvider>
        <HeaderDesktop />
        <ConditionalMobileHeader />
        {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
        <div className="hidden md:block h-[169px]"></div>
        {/* Spacer for mobile header (56px) - conditionally rendered */}
        <ConditionalMobileHeaderSpacer />
        <main className="pb-16 md:pb-0 px-2 md:px-0">
          {children}
        </main>
        <BottomNav />
      </SavedItemsProvider>
    );
  }

  // For authenticated users, load account context
  const account = await loadAccountContext(user.id);

  return (
    <AccountProvider account={account}>
      <SavedItemsProvider>
        <HeaderDesktop />
        <ConditionalMobileHeader />
        {/* Spacer for desktop header (40px top bar + 80px main nav + 1px border + 48px secondary nav = 169px) */}
        <div className="hidden md:block h-[169px]"></div>
        {/* Spacer for mobile header (56px) - conditionally rendered */}
        <ConditionalMobileHeaderSpacer />
        <main className="pb-16 md:pb-0 px-2 md:px-0">
          {children}
        </main>
        <BottomNav />
      </SavedItemsProvider>
    </AccountProvider>
  );
}

