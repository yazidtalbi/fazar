"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Heart, Bell, Gift, Globe, LayoutDashboard, MapPin, ChevronDown, Sparkles, Grid3x3, Radio, Store, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CartCountBadge } from "@/components/zaha/cart-count-badge";
import { NotificationsDropdown } from "@/components/zaha/notifications-dropdown";

export function HeaderDesktop(): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated and if they have a store
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      setUser(user);
      
      // Check if user has a store
      if (user) {
        // First check if they have a seller profile
        const { data: sellerProfile } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", user.id)
          .single();
        
        if (sellerProfile) {
          // Check if they have a store
          const { data: store } = await supabase
            .from("stores")
            .select("id")
            .eq("seller_id", user.id)
            .single();
          
          setHasStore(!!store);
        } else {
          setHasStore(false);
        }
      } else {
        setHasStore(null);
      }
    }
    checkUser();
  }, []);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } bg-white border-b border-gray-100`}
    >
      {/* Top Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/app" className="text-2xl font-bold text-[#222222] hover:text-[#222222]/80 transition-colors">
                ANDALUS
              </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Cherchez ce que vous voulez"
                  className="w-full pl-4 pr-12 py-2.5 rounded-full text-[#222222] placeholder-gray-400 border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value;
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input?.value) {
                      router.push(`/search?q=${encodeURIComponent(input.value)}`);
                    }
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-4">
              {/* Saved Items */}
              <Link 
                href="/app/saved" 
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Saved items"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Gifts/Best Deals */}
              <Link 
                href="/search?category=sale" 
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Best deals"
              >
                <Gift className="h-5 w-5" />
              </Link>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* Store/Marketplace */}
              <Link 
                href="/app" 
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Store"
              >
                <Store className="h-5 w-5" />
              </Link>

              {/* Dashboard (if seller) */}
              {user && hasStore === true && (
                <Link 
                  href="/seller" 
                  className="text-gray-600 hover:text-primary transition-colors relative"
                  aria-label="Dashboard"
                >
                  <div className="relative">
                    <LayoutDashboard className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 absolute -bottom-1 -right-1 text-gray-400" />
                  </div>
                </Link>
              )}

              {/* User Account */}
              {user ? (
                <Link 
                  href="/app/profile" 
                  className="text-gray-600 hover:text-primary transition-colors relative"
                  aria-label="Account"
                >
                  <div className="relative">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 absolute -bottom-1 -right-1 text-gray-400" />
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-primary transition-colors relative"
                  aria-label="Sign in"
                >
                  <div className="relative">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 absolute -bottom-1 -right-1 text-gray-400" />
                  </div>
                </Link>
              )}

              {/* Cart */}
              <CartCountBadge />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-6 h-12 overflow-x-auto scrollbar-hide">
            {/* All Categories */}
            <button className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors border-r border-gray-200 pr-6">
              <Grid3x3 className="h-4 w-4" />
              <span>All Categories</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Category Links */}
            <Link
              href="/categories?slug=electronics"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Electronics
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=fashion"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Fashion
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=womens"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Women&apos;s
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=kids"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Kids&apos; Fashion
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=beauty"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Healthy & Beauty
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=pharmacy"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Pharmacy
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=groceries"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Groceries
            </Link>
            <div className="w-px h-4 bg-gray-200"></div>
            <Link
              href="/categories?slug=luxury"
              className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
            >
              Luxury Item
            </Link>

            {/* Best Deals */}
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/search?category=sale"
                className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
              >
                <Gift className="h-4 w-4" />
                <span>Best Deals</span>
              </Link>
              <Link
                href="/live"
                className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
              >
                <span>ANDALUS Live</span>
                <div className="relative">
                  <Radio className="h-4 w-4 text-red-500" />
                  <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

