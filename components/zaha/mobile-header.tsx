"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProfileDrawer } from "@/components/zaha/profile-drawer";
import { NotificationsDropdown } from "@/components/zaha/notifications-dropdown";

export function MobileHeader(): React.ReactElement {
  const [user, setUser] = useState<any>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    checkUser();
  }, []);

  // Get user initials for avatar
  const userInitials = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <>
      <header className="md:hidden border-b bg-background sticky top-0 z-40">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/app" className="flex items-center gap-2">
              <Image
                src="/icon.png"
                alt="Afus"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">Afus</span>
            </Link>

            {/* Right side: Notifications and Profile */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <NotificationsDropdown />
                  <button
                    onClick={() => setProfileDrawerOpen(true)}
                    className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
                    aria-label="Profile"
                  >
                    {userInitials}
                  </button>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      {user && (
        <ProfileDrawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} />
      )}
    </>
  );
}

