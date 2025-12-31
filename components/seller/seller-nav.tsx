"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Package, ShoppingBag, User, Megaphone, ArrowLeft, Home, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function SellerNav(): React.ReactElement {
  const pathname = usePathname();

  const navItems = [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/store", label: "Store", icon: Store },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
    { href: "/seller/credits", label: "Credits", icon: Coins },
    { href: "/seller/promotions", label: "Promotions", icon: Megaphone },
    { href: "/seller/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Mobile: Horizontal Navigation */}
      <nav className="md:hidden border-b bg-background sticky top-0 z-40">
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

      {/* Desktop: Vertical Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30">
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/seller" className="text-2xl font-bold text-[#222222] hover:text-[#222222]/80 transition-colors">
              ANDALUS
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Seller Dashboard</p>
            <Link 
              href="/app" 
              className="flex items-center gap-2 mt-3 text-sm text-muted-foreground hover:text-[#222222] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to App</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

