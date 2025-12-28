"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2, ChevronLeft } from "lucide-react";

interface ProductStickyHeaderProps {
  title: string;
  imageUrl: string | null;
  productId: string;
}

export function ProductStickyHeader({ title, imageUrl, productId }: ProductStickyHeaderProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleScroll() {
      // Show sticky header when user scrolls past the hero image (approximately 400px)
      setIsVisible(window.scrollY > 400);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return <></>;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }

  function handleBack() {
    router.back();
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-50 h-16 flex items-center px-4">
      <div className="container mx-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        {imageUrl && (
          <div className="relative w-10 h-10 bg-muted flex-shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        )}
        <h1 className="text-base font-bold truncate flex-1">{title}</h1>
        <Button variant="ghost" size="icon" onClick={handleShare} className="flex-shrink-0">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

