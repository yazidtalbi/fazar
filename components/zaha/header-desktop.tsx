"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Heart, Bell, Gift, Globe, LayoutDashboard, MapPin, ChevronDown, Sparkles, Grid3x3, Radio, Store, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CartCountBadge } from "@/components/zaha/cart-count-badge";
import { NotificationsDropdown } from "@/components/zaha/notifications-dropdown";
import { ProfileDrawer } from "@/components/zaha/profile-drawer";

export function HeaderDesktop(): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Get user initials for avatar
  const userInitials = user?.email?.charAt(0).toUpperCase() || "?";
  const userName = user?.email?.split("@")[0] || "User";

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
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name")
        .limit(10);
      
      if (data) {
        setCategories(data);
      }
    }
    
    fetchCategories();
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
      } bg-white`}
    >
      {/* Top Bar - Dark Grey */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-[100rem] mx-auto px-12">
          <div className="flex items-center justify-between h-10 text-sm">
            {/* Left: Region/Language */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>MA | français</span>
            </div>

            {/* Center: Promotional Message */}
            <div className="flex-1 text-center">
              <span>Rejoignez-nous dès maintenant! c&apos;est gratuit, c&apos;est facile.</span>
            </div>

            {/* Right: Store Selection */}
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span>Choisir un magasin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - White */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[100rem] mx-auto px-12">
          <div className="flex items-center gap-6 h-20">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-8 flex-1">
              <Link href="/app" className="text-2xl font-bold text-[#222222] hover:text-[#222222]/80 transition-colors flex-shrink-0">
                OFUS
              </Link>
              
              {/* Search Bar - Light Grey (next to logo) */}
              <div className="relative flex items-center flex-1 max-w-4xl">
                <Search className="absolute left-4 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Que cherchez-vous ?"
                  className="w-full pl-12 pr-4 py-2.5 rounded-full text-[#222222] placeholder-gray-400 border-0 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value;
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-4 ml-auto">
              {/* User Avatar & Greeting */}
              {user ? (
                <button
                  onClick={() => setProfileDrawerOpen(true)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Account"
                >
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium text-[#222222]">
                    Salam {userName} !
                  </span>
                </button>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-[#222222] px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors"
                >
                  Se connecter
                </Link>
              )}

              {/* Saved Items */}
              <Link 
                href="/app/saved" 
                className="text-gray-600 hover:text-primary hover:bg-gray-100 p-2 rounded-lg transition-colors"
                aria-label="Saved items"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* Dashboard (if seller) */}
              {user && hasStore === true && (
                <Link 
                  href="/seller" 
                  className="text-gray-600 hover:text-primary hover:bg-gray-100 p-2 rounded-lg transition-colors relative"
                  aria-label="Dashboard"
                >
                  <div className="relative">
                    <LayoutDashboard className="h-5 w-5" />
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
        <div className="max-w-[100rem] mx-auto px-12">
          <nav className="flex items-center gap-6 h-12 overflow-x-auto scrollbar-hide">
            {/* All Categories */}
            <button className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors border-r border-gray-200 pr-6">
              <Grid3x3 className="h-4 w-4" />
              <span>All Categories</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Category Links */}
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
                >
                  {category.name}
                </Link>
                {index < categories.length - 1 && (
                  <div className="w-px h-4 bg-gray-200"></div>
                )}
              </React.Fragment>
            ))}

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
                <span>OFUS Live</span>
                <div className="relative">
                  <Radio className="h-4 w-4 text-red-500" />
                  <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Profile Drawer */}
      <ProfileDrawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} />
    </header>
  );
}

