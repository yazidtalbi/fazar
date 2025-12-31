"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  storeId: string;
}

export function FollowButton({ storeId }: FollowButtonProps): React.ReactElement {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function checkFollowStatus() {
      try {
        const response = await fetch(`/api/follow?storeId=${storeId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing || false);
        }
      } catch (error) {
        console.error("Failed to check follow status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkFollowStatus();
  }, [storeId]);

  async function handleToggleFollow() {
    setIsToggling(true);
    try {
      const url = `/api/follow${isFollowing ? `?storeId=${storeId}` : ""}`;
      const method = isFollowing ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isFollowing ? undefined : JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        throw new Error(isFollowing ? "Failed to unfollow" : "Failed to follow");
      }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed store" : "Following store");
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setIsToggling(false);
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
        <Heart className="h-4 w-4" />
        Follow
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size="sm"
      onClick={handleToggleFollow}
      disabled={isToggling}
      className="flex items-center gap-2"
    >
      <Heart className={`h-4 w-4 ${isFollowing ? "fill-white" : ""}`} />
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

