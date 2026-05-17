"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { capitalize } from "@/lib/utils";

interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
  rating: number;
  reviewCount: number;
  latestProductImage: string | null;
}

interface PopularStoresCarouselProps {
  stores: Store[];
}

export function PopularStoresCarousel({ stores }: PopularStoresCarouselProps): React.ReactElement {
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
    <div className="mb-16">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl md:text-4xl font-bold">
            Nouvelles boutiques locales
          </h2>
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
          </div>
        </div>
        <p className="text-base text-neutral-600">
          Découvrez les derniers artisans à rejoindre notre communauté.
        </p>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
      >
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.slug}`}
            className="flex-shrink-0 w-64"
          >
            <div className="arabic-frame bg-border p-[1px] h-full">
              <Card className="overflow-hidden hover:border-primary/30 transition-colors border-none rounded-none arabic-frame bg-white h-full flex flex-col">
                {/* Store Avatar and Latest Product Image */}
                <div className="relative aspect-square w-full flex items-center justify-center">
                  {/* Background with Arabic Frame */}
                  <div className="absolute inset-0 bg-[#f0f7ff] arabic-frame" />

                  {/* Circular Avatar on Top */}
                  <div className="relative w-28 h-28 rounded-full bg-white overflow-hidden flex-shrink-0 border-4 border-white z-10 shadow-md">
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground bg-muted">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{store.name}</h4>
                    {store.city && (
                      <p className="text-sm text-muted-foreground mb-2">{capitalize(store.city)}</p>
                    )}
                    {store.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({store.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

