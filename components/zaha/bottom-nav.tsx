"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav(): React.ReactElement {
  const pathname = usePathname();

  const navItems = [
    { href: "/app", label: "HOME", icon: Home },
    { href: "/search", label: "SHOP", icon: Grid3x3 },
    { href: "/seller/products/new", label: "SELL", icon: Plus, highlight: true },
    { href: "/app/saved", label: "SAVED", icon: Heart },
    { href: "/app/profile", label: "PROFILE", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden">
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
              {item.highlight ? (
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className={cn("font-medium", item.highlight && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

