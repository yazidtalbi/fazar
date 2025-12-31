"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface PromotionalSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
}

const promotionalSlides: PromotionalSlide[] = [
  {
    id: "1",
    title: "Obtenez jusqu'à -50% sur",
    subtitle: "des trouvailles de saison",
    buttonText: "Voir les promos de fin d'année",
    buttonLink: "/search?category=sale",
    bgColor: "bg-teal-700",
  },
  {
    id: "2",
    title: "Nouveautés",
    subtitle: "Découvrez nos dernières créations",
    buttonText: "Voir les nouveautés",
    buttonLink: "/search?sort=newest",
    bgColor: "bg-teal-700",
  },
  {
    id: "3",
    title: "Meilleures offres",
    subtitle: "Profitez de nos promotions",
    buttonText: "Voir toutes les offres",
    buttonLink: "/search?category=sale",
    bgColor: "bg-teal-700",
  },
];

export function PromotionalBanner(): React.ReactElement {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full h-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="h-full">
        {promotionalSlides.map((slide) => (
          <CarouselItem key={slide.id} className="h-full">
            <div className={`${slide.bgColor} h-full rounded-lg flex flex-col justify-center px-8 py-12 text-white`}>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">{slide.title}</h2>
                <p className="text-xl">{slide.subtitle}</p>
                <Link href={slide.buttonLink}>
                  <Button
                    variant="secondary"
                    className="bg-white text-teal-700 hover:bg-gray-100 rounded-full mt-4"
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

