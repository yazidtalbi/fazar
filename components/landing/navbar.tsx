"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const NAV_LINKS = [
  { href: "#manifesto", label: "What", color: "#e06a35" },
  { href: "#features", label: "Why", color: "#d4b300" },
  { href: "#faq", label: "How", color: "#d86adf" },
];

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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40 && !scrolled) setScrolled(true);
    if (latest <= 40 && scrolled) setScrolled(false);
  });

  return (
    <nav className="hidden md:block fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-none top-4 w-full">
      <div
        className={`
          mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 lg:pr-4 py-3
          transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]
          pointer-events-auto
          ${scrolled
            ? "max-w-5xl bg-white arabic-frame border border-[#f3e3d9]"
            : "max-w-[1400px] bg-transparent shadow-none rounded-none border-none"
          }
        `}
        style={{ marginBottom: "18px" }}
      >
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
          <Image src="/icon2.png" alt="Afus" width={40} height={40} className="h-6 w-auto sm:h-8" priority />
          <Image src="/afus.svg" alt="Afus" width={60} height={24} className="h-3.5 w-auto sm:h-4" priority />
        </Link>

        <div className="hidden md:flex items-center gap-10 ml-6">
          {NAV_LINKS.map((item) => (
            <a key={item.label} href={item.href} className="flex items-center gap-2 text-sm sm:text-base font-medium text-[#341339] hover:opacity-80">
              <span className="flex h-3 w-3 items-center justify-center" style={{ color: item.color }}>
                <BrandStar className="h-2.5 w-2.5" />
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-[#23102f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d183b] transition-colors">
          <span>Open the app</span>
        </Link>
      </div>
    </nav>
  );
}
