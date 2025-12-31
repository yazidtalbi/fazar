"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface MessageStoreButtonProps {
  storeId: string;
  sellerId: string;
  storeName: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  fullWidth?: boolean;
}

export function MessageStoreButton({ 
  storeId, 
  sellerId, 
  storeName,
  className = "",
  size = "sm",
  fullWidth = false
}: MessageStoreButtonProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleMessage() {
    setIsLoading(true);
    try {
      // Get or create conversation with the seller
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: sellerId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      router.push(`/app/messages?conversation=${data.conversationId}`);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      // Still navigate to messages page - user can start conversation there
      router.push("/app/messages");
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      // Still navigate to messages page - user can start conversation there
      router.push("/app/messages");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleMessage}
      disabled={isLoading}
      className={`flex items-center gap-2 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Message
    </Button>
  );
}

