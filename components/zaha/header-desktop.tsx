"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Heart, Bell, Gift, Globe, LayoutDashboard, MapPin, ChevronDown, Sparkles, Grid3x3, Store, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CartCountBadge } from "@/components/zaha/cart-count-badge";
import { NotificationsDropdown } from "@/components/zaha/notifications-dropdown";
import { ProfileDrawer } from "@/components/zaha/profile-drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/auth-modal";

export function HeaderDesktop(): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
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
        .order("name");
      
      if (data) {
        setAllCategories(data);
      }
      
      // Use static list of categories matching home page (don't fetch each time)
      const staticCategories = [
        { id: 'jewelry', name: 'Jewelry', slug: 'jewelry' },
        { id: 'art', name: 'Art', slug: 'art' },
        { id: 'beauty', name: 'Beauty', slug: 'beauty' },
        { id: 'clothing', name: 'Clothing', slug: 'clothing' },
        { id: 'bags', name: 'Bags', slug: 'bags' },
        { id: 'home-living', name: 'Home Living', slug: 'home-living' },
        { id: 'baby', name: 'Baby', slug: 'baby' },
      ];
      setCategories(staticCategories);
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
      {/* Top Bar */}
      <div style={{ backgroundColor: '#f5e8fb', color: 'rebeccapurple' }}>
        <div className="max-w-[100rem] mx-auto px-12">
          <div className="flex items-center justify-between h-10 text-sm font-semibold">
            {/* Left: Region/Language */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>MA | français</span>
            </div>

            {/* Center: Promotional Message */}
            <div className="flex-1 text-center">
              <span>Your place to buy & sell all things handmade</span>
            </div>

            {/* Right: Store Selection */}
            {user ? (
              <Link 
                href={hasStore ? "/seller" : "/onboarding/seller"}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Store className="h-4 w-4" />
                <span>{hasStore ? "Manage my Afus Shop" : "Sell on Afus"}</span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Store className="h-4 w-4" />
                <span>Sell on Afus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - White */}
      <div className="bg-white">
        <div className="max-w-[100rem] mx-auto px-12">
          <div className="flex items-center gap-6 h-20 border-b border-border">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-8 flex-1">
              <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
                <Image
                  src="/icon.png"
                  alt="Afus"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
                <span className="text-2xl font-bold text-[#222222]">Afus</span>
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
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-sm font-medium text-[#222222] px-3 py-2 rounded-xl hover:bg-muted hover:text-primary transition-colors"
                >
                  Se connecter
                </button>
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
            {/* All Categories - Popover */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors pr-6 px-3 py-1.5 rounded-xl bg-white">
                  <Grid3x3 className="h-4 w-4" />
                  <span>All Categories</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto bg-white">
                {allCategories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="cursor-pointer"
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Category Links - Maximum 7 */}
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                {index > 0 && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 108 110"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    style={{ color: '#f3ece4' }}
                  >
                    <path d="M54.1416 0.291992L70.5439 16.6943H92.1592V38.8096L107.913 54.5645L107.991 54.6426L92.1592 70.4746V92.8408H70.5439L54.1416 109.243V109.535L53.9951 109.389L53.8496 109.535V109.243L37.4473 92.8408H15.832V70.4746L0 54.6426L0.078125 54.5645L15.832 38.8096V16.6943H37.4473L53.8496 0.291992V0L53.9951 0.145508L54.1416 0V0.291992Z" />
                  </svg>
                )}
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm font-medium text-[#222222] hover:text-primary whitespace-nowrap transition-colors"
                >
                  {category.name}
                </Link>
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
            </div>
          </nav>
        </div>
      </div>
      
      {/* Profile Drawer */}
      <ProfileDrawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} />
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} initialMode="login" />
    </header>
  );
}

