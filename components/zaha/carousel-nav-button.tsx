"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface CarouselNavButtonProps {
  scrollAmount?: number;
}

export function CarouselNavButton({ scrollAmount = 320 }: CarouselNavButtonProps): React.ReactElement {
  function handleScroll() {
    // Find the nearest carousel container (parent with overflow-x-auto)
    const button = document.activeElement as HTMLElement;
    if (button) {
      const container = button.closest('.relative')?.querySelector('.overflow-x-auto') as HTMLElement;
      if (container) {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-0 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full h-10 w-10 z-10"
      onClick={handleScroll}
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  );
}

