"use client";

import Image from "next/image";
import { motion, MotionValue } from "framer-motion";
import { Download } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600"],
  style: ["italic"],
});

const BrandStar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 108 110"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M54.1416 0.291992L70.5439 16.6943H92.1592V38.8096L107.913 54.5645L107.991 54.6426L92.1592 70.4746V92.8408H70.5439L54.1416 109.243V109.535L53.9951 109.389L53.8496 109.535V109.243L37.4473 92.8408H15.832V70.4746L0 54.6426L0.078125 54.5645L15.832 38.8096V16.6943H37.4473L53.8496 0.291992V0L53.9951 0.145508L54.1416 0V0.291992Z" />
  </svg>
);

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface HeroProps {
  windowHeight: number;
  bgPosY: MotionValue<string> | MotionValue<number>;
  heroScale: MotionValue<number>;
  heroOpacity: MotionValue<number>;
  imageOffset: MotionValue<number>;
  contentOffset: MotionValue<number>;
}

export function Hero({
  windowHeight,
  bgPosY,
  heroScale,
  heroOpacity,
  imageOffset,
  contentOffset,
}: HeroProps) {
  return (
    <header
      style={{
        width: "100%",
        height: windowHeight || 0,
        position: "fixed",
        top: 0,
        zIndex: 0,
        backgroundImage: "linear-gradient(to bottom, #FEF8EB, #F5E8FB)",
        backgroundPosition: `50% ${bgPosY}%`,
        backgroundSize: "cover",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-4 sm:top-18 flex justify-center"
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          transformOrigin: "center top",
        }}
      >
        <span className="vazirmatn-font select-none text-[22vw] sm:text-[18vw] mt-0 sm:mt-10 font-bold leading-none text-[#E5C0F4]">
          أفــوس
        </span>
      </motion.div>

      <motion.div
        className="relative z-10 flex h-full items-center"
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          transformOrigin: "center center",
        }}
      >
        <motion.section
          className="relative h-full w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center md:inset-0 md:items-center"
            style={{
              y: imageOffset,
              transformOrigin: "center bottom",
            }}
          >
            <motion.div
              className="relative w-full max-w-sm h-[55vh] md:max-w-none md:h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3, ease: EASE, delay: 0.15 }}
            >
              <Image
                src="/landing/handspremium2.webp"
                alt="Afus app in hand"
                fill
                className="object-contain object-bottom md:object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-0 sm:mt-24 relative z-10 mx-auto flex h-full max-w-[90vw] flex-col items-center justify-center gap-10 px-4 pt-24 pb-[34vh] sm:pt-28 sm:pb-[36vh] md:flex-row md:items-center md:justify-end md:gap-12 md:px-8 lg:px-12 md:pb-24"
            style={{
              y: contentOffset,
              transformOrigin: "center center",
            }}
          >
            <div className="w-full max-w-sm text-center md:flex-1 mt-0 sm:mt-10">
              <motion.div
                className="mx-auto mb-4 flex items-center justify-center sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
              >
                <BrandStar className="h-6 w-6 text-[#C9B6A6] sm:h-6 sm:w-6" />
              </motion.div>

              <motion.h1
                className="text-[2.1rem] sm:text-[2.6rem] md:text-[2.8rem] font-semibold leading-10 sm:leading-13 text-[#1B1124]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
              >
                Discover
                <br />
                products made
                <br />
                with{" "}
                <span className={`${playfair.className} italic font-normal`}>
                  Soul
                </span>
              </motion.h1>
            </div>

            <div className="hidden flex-1 md:block" />

            <motion.div
              className="w-full max-w-xs text-center md:flex-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.4 }}
            >
              <p className="text-base sm:text-lg leading-relaxed text-[#1B1124] font-normal mt-0 sm:mt-7">
                Connect with Morocco&apos;s
                <br className="hidden sm:block" />
                most talented artisans & discover{" "}
                <br className="hidden sm:block" />
                pieces you won&apos;t find anywhere else.
              </p>

              <motion.div
                className="mt-5 flex justify-center sm:mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
              >
                <button className="inline-flex sm:hidden items-center gap-2 rounded-full bg-[#23102f] px-6 py-3 text-sm sm:text-base font-medium text-white shadow-[0_14px_32px_rgba(0,0,0,0.35)] transition-colors hover:bg-[#2d183b]">
                  <Download className="h-4 w-4" />
                  <span>Install the App now</span>
                </button>
                <div className="hidden sm:inline-flex items-center gap-4 rounded-md bg-white px-2 py-3 sm:px-2 sm:py-2 sm:pr-10">
                  <div className="flex items-center justify-center rounded-lg bg-white overflow-hidden">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                      <Image
                        src="/landing/qr.jpg"
                        alt="Scan to install the Afus app"
                        fill
                        className="object-contain"
                        priority={false}
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] sm:text-lg font-semibold text-[#2a1335] leading-6">
                      Scan to <br />
                      launch the <br />
                      Afus app
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </motion.div>
    </header>
  );
}
