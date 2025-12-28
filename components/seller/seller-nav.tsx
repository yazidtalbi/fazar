"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Package, ShoppingBag, User, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function SellerNav(): React.ReactElement {
  const pathname = usePathname();

  const navItems = [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/store", label: "Store", icon: Store },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
    { href: "/seller/promotions", label: "Promotions", icon: Megaphone },
    { href: "/seller/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

