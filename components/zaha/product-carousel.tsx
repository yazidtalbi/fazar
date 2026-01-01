"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";

interface ProductCarouselProps {
  title: string;
  products: any[];
  viewAllHref: string;
  viewAllText?: string;
}

export function ProductCarousel({ title, products, viewAllHref, viewAllText = "Voir tout" }: ProductCarouselProps): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden md:block max-w-[100rem] mx-auto px-12 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#222222]">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            className="rounded-full"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            className="rounded-full"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Link href={viewAllHref}>
            <Button variant="ghost" className="text-sm">
              {viewAllText}
            </Button>
          </Link>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
      >
        {products.slice(0, 10).map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

