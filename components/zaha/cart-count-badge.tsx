"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getGuestCartCount } from "@/lib/utils/guest-cart";

export function CartCountBadge(): React.ReactElement {
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          const items = data.cartItems || [];
          // Sum up all quantities
          const totalCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(totalCount);
        } else if (response.status === 401) {
          // User not authenticated, use guest cart count
          const guestCount = getGuestCartCount();
          setCartCount(guestCount);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
        // On error, try guest cart
        const guestCount = getGuestCartCount();
        setCartCount(guestCount);
      }
    }

    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    // Listen for guest cart update events
    const handleGuestCartUpdate = () => {
      const guestCount = getGuestCartCount();
      setCartCount(guestCount);
    };

    // Listen for custom cart update events
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("guestCartUpdated", handleGuestCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("guestCartUpdated", handleGuestCartUpdate);
    };
  }, []);

  // Determine which cart page to link to
  const cartLink = cartCount > 0 && pathname?.startsWith("/app") === false ? "/cart" : "/app/cart";

  return (
    <Link 
      href={cartLink}
      className="text-gray-600 hover:text-primary hover:bg-gray-100 p-2 rounded-lg transition-colors relative"
      aria-label="Shopping cart"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </div>
    </Link>
  );
}

