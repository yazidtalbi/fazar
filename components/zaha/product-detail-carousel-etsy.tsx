"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductDetailCarouselEtsyProps {
  media: Array<{
    media_url: string;
    media_type: string;
    order_index: number;
  }>;
}

export function ProductDetailCarouselEtsy({ media }: ProductDetailCarouselEtsyProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  function handleImageClick() {
    setIsFullscreen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleWheel(e: React.WheelEvent) {
    if (isFullscreen) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }

  useEffect(() => {
    if (!isFullscreen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

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
        className="relative flex-1 bg-muted cursor-pointer"
        style={{ height: 'calc(100vh - 114px)' }}
        onClick={handleImageClick}
      >
        {currentMedia.media_type === "video" ? (
          <video
            src={currentMedia.media_url}
            className="w-full h-full object-contain"
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Fullscreen Zoomable Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Arrows */}
            {sortedMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Zoomable Image */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {currentMedia.media_type === "video" ? (
                <video
                  src={currentMedia.media_url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  playsInline
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                />
              ) : (
                <div
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                >
                  <Image
                    src={currentMedia.media_url}
                    alt={`Product image ${currentIndex + 1}`}
                    width={2000}
                    height={2000}
                    className="object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100vh' }}
                  />
                </div>
              )}
            </div>

            {/* Image Counter */}
            {sortedMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                {currentIndex + 1} / {sortedMedia.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

