import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AccountProvider } from "@/components/account-provider";
import { SavedItemsProvider } from "@/components/saved-items-provider";
import { NotificationsProvider } from "@/components/notifications-provider";
import { loadAccountContext } from "@/lib/server/account/load-account";
import { HeaderDesktop } from "@/components/zaha/header-desktop";
import { ConditionalMobileHeader } from "@/components/zaha/conditional-mobile-header";
import { ConditionalMobileHeaderSpacer } from "@/components/zaha/conditional-mobile-header-spacer";
import { BottomNav } from "@/components/zaha/bottom-nav";
import { StoreDiscoverySection } from "@/components/zaha/store-discovery-section";
import { ProjectExplanation } from "@/components/zaha/project-explanation";
import { Footer } from "@/components/zaha/footer";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";
import { ScrollToTop } from "@/components/zaha/scroll-to-top";
import Loading from "./loading";

async function AuthenticatedAccountProvider({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const account = await loadAccountContext(user.id);
  return (
    <AccountProvider account={account}>
      {children}
    </AccountProvider>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider>
      <SavedItemsProvider>
        <HeaderDesktop />
        <ConditionalMobileHeader />
        
        {/* Spacer for desktop header */}
        <div className="hidden md:block h-[169px]"></div>
        
        {/* Spacer for mobile header - conditionally rendered */}
        <ConditionalMobileHeaderSpacer />
        
        <Suspense fallback={<Loading />}>
          <AuthenticatedAccountProvider>
            <NuqsAdapterProvider>
              <ScrollToTop />
              <main className="pb-16 md:pb-0 px-2 md:px-0">
                {children}
              </main>
            </NuqsAdapterProvider>
          </AuthenticatedAccountProvider>
        </Suspense>
        
        {/* Shared sections at the bottom of all main pages */}
        <div className="hidden md:block">
          <StoreDiscoverySection />
          <ProjectExplanation />
          <Footer />
        </div>
        
        <BottomNav />
      </SavedItemsProvider>
    </NotificationsProvider>
  );
}
