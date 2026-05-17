import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ShoppingCart, Search, Bell } from "lucide-react";

export async function Header(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="Afus" width={32} height={32} className="h-8 w-auto" priority />
            <Image src="/afus.svg" alt="Afus" width={56} height={20} className="h-4 w-auto" priority />
            <span className="text-xs text-muted-foreground hidden sm:inline ml-2">
              ARTISAN MARKETPLACE
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-sm hover:text-primary transition-colors">
              Search
            </Link>
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </Link>
                <Link href="/seller">
                  <Button variant="outline" size="sm">
                    Seller Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {user && (
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/search">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


