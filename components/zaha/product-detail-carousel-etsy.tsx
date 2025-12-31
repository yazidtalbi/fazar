"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDetailCarouselEtsyProps {
  media: Array<{
    media_url: string;
    media_type: string;
    order_index: number;
  }>;
}

export function ProductDetailCarouselEtsy({ media }: ProductDetailCarouselEtsyProps): React.ReactElement {
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
    <div className="flex gap-4">
      {/* Thumbnails on the left */}
      {sortedMedia.length > 1 && (
        <div className="flex flex-col gap-2 w-20 flex-shrink-0">
          {sortedMedia.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative aspect-square w-full bg-muted border-2 transition-all ${
                index === currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image
                src={item.media_url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="relative flex-1 bg-muted"
        style={{ height: 'calc(100vh - 114px)' }}
      >
        {currentMedia.media_type === "video" ? (
          <video
            src={currentMedia.media_url}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
        ) : (
          <Image
            src={currentMedia.media_url}
            alt={`Product image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
          />
        )}

        {/* Navigation Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

