"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface FollowShopButtonProps {
  storeId: string;
}

export function FollowShopButton({ storeId }: FollowShopButtonProps): React.ReactElement {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUserAndFollowStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const response = await fetch(`/api/follow?storeId=${storeId}`);
          if (response.ok) {
            const data = await response.json();
            setIsFollowing(data.isFollowing || false);
          }
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      }
      setIsLoading(false);
    }
    checkUserAndFollowStatus();
  }, [storeId]);

  async function handleFollow() {
    if (!user) {
      toast.error("Please log in to follow shops");
      return;
    }

    setIsLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const url = isFollowing ? `/api/follow?storeId=${storeId}` : "/api/follow";
      const body = isFollowing ? undefined : JSON.stringify({ storeId });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed shop" : "Following shop");
    } catch (error: any) {
      console.error("Error updating follow status:", error);
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleFollow}
      disabled={isLoading || !user}
    >
      <Heart className={`h-4 w-4 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
      {isFollowing ? "Following" : "Follow shop"}
    </Button>
  );
}

