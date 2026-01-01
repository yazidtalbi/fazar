"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function WelcomeClient(): React.ReactElement | null {
  const router = useRouter();
  const [shouldShow, setShouldShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      if (typeof window === "undefined") return false;
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      return isMobileDevice || isSmallScreen;
    };

    const mobile = checkMobile();
    setIsMobile(mobile);

    // Check if welcome page has been shown before
    const hasSeenWelcome = typeof window !== "undefined" ? localStorage.getItem("afus_welcome_seen") : null;

    if (!mobile) {
      // Not mobile - redirect to app immediately
      router.replace("/app");
      return;
    }

    if (hasSeenWelcome) {
      // Already seen - redirect to app immediately
      router.replace("/app");
      return;
    }

    // First time on mobile - show welcome page
    setShouldShow(true);
  }, [router]);

  const handleContinue = () => {
    // Mark as seen
    if (typeof window !== "undefined") {
      localStorage.setItem("afus_welcome_seen", "true");
    }
    router.push("/app");
  };

  // Don't render until we've checked (or if redirecting)
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">AFUS</h1>
          <p className="text-sm text-muted-foreground uppercase">ARTISAN MARKETPLACE</p>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-md h-64 bg-gradient-to-b from-primary/20 to-background mb-12 relative overflow-hidden">
        </div>

        {/* Headline */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Timeless Crafts. Direct from the Atlas.
          </h2>
          <p className="text-muted-foreground">
            Discover authentic handmade treasures or share your creations with the world.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          <Button 
            className="w-full h-14 text-base" 
            size="lg"
            onClick={handleContinue}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            SHOP GOODS
            <span className="ml-auto">→</span>
          </Button>
          <Link href="/auth/register" className="block" onClick={handleContinue}>
            <Button variant="outline" className="w-full h-14 text-base" size="lg">
              SELL CRAFT
              <span className="ml-auto">→</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center border-t">
        <p className="text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/auth/login" className="text-primary underline" onClick={handleContinue}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

