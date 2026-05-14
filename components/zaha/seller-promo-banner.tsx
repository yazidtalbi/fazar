"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

const slides = [
  {
    title: "The world of handmade",
    description: "Launch your digital storefront in minutes. Empower your craft and connect with a growing community of conscious shoppers across Morocco.",
    buttonText: "Become a seller now",
    image: "/seller.png",
    bgColor: "bg-[#1b0f2b]",
    textColor: "text-[#F3E2F5]"
  },
  {
    title: "Passion into profit",
    description: "From workshop to doorstep. Share your Moroccan heritage with the world and scale your business with our dedicated artisan dashboard.",
    buttonText: "Open your shop",
    image: "/seller.png",
    bgColor: "bg-[#2d1b4d]",
    textColor: "text-[#E8D5E8]"
  },
  {
    title: "Share your craft",
    description: "Crafted by you, discovered by many. Start your professional selling journey today and reach buyers from Tangier to Lagouira.",
    buttonText: "Discover more",
    image: "/seller.png",
    bgColor: "bg-[#1a1a1a]",
    textColor: "text-white/80"
  }
];

export function SellerPromoBanner(): React.ReactElement {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="w-full h-full">
      <div className="mx-auto w-full h-full max-w-7xl px-4">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          className="w-full h-full flex flex-col"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
            duration: 15,
            skipSnaps: false,
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full will-change-transform transform-gpu">
                <div className={`relative ${slide.bgColor} px-[3.75rem] py-12 sm:px-14 sm:py-16 lg:px-[3.75rem] lg:py-10 h-[476px] flex items-center overflow-hidden will-change-transform transform-gpu arabic-frame`}>
                  <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 w-full">
                    {/* Left */}
                    <div className="max-w-xl pt-16 pb-16 md:pt-20 md:pb-20">
                      <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl font-roslindale">
                        {slide.title}
                      </h2>

                      <p className={`mt-8 max-w-md text-base leading-snug sm:text-lg ${slide.textColor}`}>
                        {slide.description}
                      </p>

                      <div className="mt-10">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center !rounded-full bg-white px-8 py-3 text-sm font-bold text-[#160a23] transition hover:opacity-95 active:opacity-90 sm:text-base"
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative h-72 w-72 mx-auto">
                        <Image
                          src={slide.image}
                          alt="Seller"
                          fill
                          className="object-contain"
                          priority={index === 0 || index === 1}
                          sizes="(max-w-768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Fixed Progress Lines at the bottom of the container */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 w-32 z-20">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i === current ? "bg-white" : "bg-white/20"
                  }`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
}
