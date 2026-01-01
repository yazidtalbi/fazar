"use client";

import { usePathname } from "next/navigation";

export function ConditionalMobileHeaderSpacer(): React.ReactElement | null {
  const pathname = usePathname();
  
  // Hide spacer on these pages on mobile
  const hideSpacerOnMobile = [
    "/app/saved",
    "/app/orders",
    "/app/cart",
  ].some(path => pathname === path || pathname.startsWith(path + "/"));

  if (hideSpacerOnMobile) {
    return null;
  }

  return <div className="md:hidden h-14"></div>;
}

