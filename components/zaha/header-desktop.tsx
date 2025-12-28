"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Heart, Menu, Gift, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
      } bg-white border-b`}
    >
      {/* Top Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo and Categories */}
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-2xl font-serif text-primary hover:text-primary/90" style={{ fontFamily: 'serif' }}>
                ZAHA
              </Link>
              <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700">
                <Menu className="h-4 w-4" />
                <span>Catégories</span>
              </button>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Cherchez ce que vous voulez"
                  className="w-full px-4 py-2.5 pr-12 rounded-full text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-primary transition-colors"
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
                  className="absolute right-1 bg-primary hover:bg-primary/90 rounded-full p-2 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Show "Vendre avec ZAHA" if user doesn't have a store */}
                  {hasStore === false && (
                    <Link href="/onboarding/seller">
                      <Button variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">
                        Vendre avec ZAHA
                      </Button>
                    </Link>
                  )}
                  <Link href="/app/saved">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/app/saved">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100">
                      <Gift className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/app/cart">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 relative">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <span className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer">
                      Se connecter
                    </span>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">
                      Vendre avec ZAHA
                    </Button>
                  </Link>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0 relative overflow-hidden" aria-label="Language selector">
                    {/* French flag colors - simplified */}
                    <div className="absolute inset-0 flex">
                      <div className="w-1/3 bg-blue-600"></div>
                      <div className="w-1/3 bg-white"></div>
                      <div className="w-1/3 bg-red-600"></div>
                    </div>
                  </button>
                  <Link href="/app/saved">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/app/saved">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100">
                      <Gift className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/app/cart">
                    <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 relative">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-6 h-10 overflow-x-auto">
            <Link
              href="/search?category=gifts"
              className="flex items-center gap-1.5 text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              <Gift className="h-4 w-4" />
              <span>Cadeaux</span>
            </Link>
            <Link
              href="/search?category=sale"
              className="text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              Trouvailles jusqu'à -50%
            </Link>
            <Link
              href="/categories?slug=deco"
              className="text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              Articles de déco
            </Link>
            <Link
              href="/categories?slug=mode"
              className="text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              Articles de mode
            </Link>
            <Link
              href="/search?category=gift-list"
              className="text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              Liste de cadeaux
            </Link>
            <Link
              href="/search?category=gift-cards"
              className="text-sm text-gray-900 hover:text-gray-700 whitespace-nowrap"
            >
              Cartes cadeaux
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

