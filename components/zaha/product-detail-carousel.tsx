"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDetailCarouselProps {
  media: Array<{
    media_url: string;
    media_type: string;
    order_index: number;
  }>;
}

export function ProductDetailCarousel({ media }: ProductDetailCarouselProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedMedia = [...media].sort((a, b) => a.order_index - b.order_index);

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? sortedMedia.length - 1 : prev - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev === sortedMedia.length - 1 ? 0 : prev + 1));
  }

  if (sortedMedia.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      </div>
    );
  }

  const currentMedia = sortedMedia[currentIndex];

  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-muted">
        {currentMedia.media_type === "video" ? (
          <video
            src={currentMedia.media_url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : (
          <Image
            src={currentMedia.media_url}
            alt={`Product image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={currentIndex === 0}
          />
        )}

        {/* Navigation Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {sortedMedia.length > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {sortedMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

