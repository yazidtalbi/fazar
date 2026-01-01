"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav(): React.ReactElement {
  const pathname = usePathname();

  const navItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/search", label: "Shop", icon: Search },
    { href: "/app/saved", label: "Saved", icon: Heart },
    { href: "/app/orders", label: "Orders", icon: Package },
    { href: "/app/cart", label: "Cart", icon: ShoppingBag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

