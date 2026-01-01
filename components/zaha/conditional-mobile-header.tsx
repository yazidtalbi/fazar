"use client";

import { usePathname } from "next/navigation";
import { MobileHeader } from "@/components/zaha/mobile-header";

export function ConditionalMobileHeader(): React.ReactElement {
  const pathname = usePathname();
  
  // Hide header on these pages on mobile
  const hideHeaderOnMobile = [
    "/app/saved",
    "/app/orders",
    "/app/cart",
  ].some(path => pathname === path || pathname.startsWith(path + "/"));

  if (hideHeaderOnMobile) {
    return null;
  }

  return <MobileHeader />;
}

