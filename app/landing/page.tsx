"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Instagram,
  Facebook,
  Twitter,
  ChevronDown,
  MapPin,
  Truck,
  ShieldCheck,
  Smartphone,
  ListChecks,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["italic"] });

const BrandStar = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="24" height="24" viewBox="0 0 108 110" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M54.1416 0.291992L70.5439 16.6943H92.1592V38.8096L107.913 54.5645L107.991 54.6426L92.1592 70.4746V92.8408H70.5439L54.1416 109.243V109.535L53.9951 109.389L53.8496 109.535V109.243L37.4473 92.8408H15.832V70.4746L0 54.6426L0.078125 54.5645L15.832 38.8096V16.6943H37.4473L53.8496 0.291992V0L53.9951 0.145508L54.1416 0V0.291992Z" />
  </svg>
);

const HERO_SLIDES = [
  {
    title: "Discover products made with",
    highlight: "Soul",
    description: "Connect with Morocco's most talented artisans & discover pieces you won't find anywhere else.",
    image: "/landing/handspremium2.png",
    bgGradient: "linear-gradient(to bottom, #FEF8EB, #F5E8FB)",
  },
  {
    title: "Traditional Craft meets",
    highlight: "Modern Life",
    description: "A marketplace built to preserve our heritage while empowering the next generation of makers.",
    image: "/landing/handspremium2.png",
    bgGradient: "linear-gradient(to bottom, #E8D5E8, #FEF8EB)",
  },
  {
    title: "Authenticity in every",
    highlight: "Detail",
    description: "From the High Atlas to the heart of Fès, we bring the best of Morocco to your doorstep.",
    image: "/landing/handspremium2.png",
    bgGradient: "linear-gradient(to bottom, #F5E8FB, #E8D5E8)",
  }
];

const FEATURE_ITEMS = [
  {
    title: "100% Moroccan",
    description: "Explore handmade pieces from independents across Morocco.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 256 256" fill="currentColor"><path d="M239.18 91.05A15.75 15.75 0 0 0 224 80h-61l-19.77-60.74a15.93 15.93 0 0 0-30.45-.05L93.06 80H32a16 16 0 0 0-9.37 29l49.46 35.58L53.15 203A15.75 15.75 0 0 0 59 220.88a15.74 15.74 0 0 0 18.77 0L128 184.75l50.23 36.13A16 16 0 0 0 202.85 203l-19-58.46l49.49-35.61a15.74 15.74 0 0 0 5.84-17.88M128 24.15L146.12 80h-36.24ZM32 96h55.87L77.3 128.56Zm36.34 112l17.39-53.59l28.54 20.54Zm22.57-69.57L104.69 96h46.62l13.75 42.38L128 165ZM187.6 208l-45.9-33l28.54-20.54Zm-8.93-79.38L168.13 96H224Z" /></svg>
    ),
  },
  {
    title: "City discovery",
    description: "Find products by city to enjoy faster delivery & lower fees.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Cash-on-delivery",
    description: "Shop confidently with COD available in many cities.",
    icon: <Truck className="h-6 w-6" />,
  },
  {
    title: "Built for mobile first",
    description: "Enjoy an experience designed for discovering unique items.",
    icon: <Smartphone className="h-6 w-6" />,
  },
  {
    title: "Favorites listings",
    description: "Save various items you love to access anytime.",
    icon: <ListChecks className="h-6 w-6" />,
  },
  {
    title: "Optimized for growth",
    description: "Manage products, orders in one simple dashboard.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
];

function RevealOnScroll({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px" }}
      transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function MarketingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return scrollY.on("change", (latest) => setScrolled(latest > 40));
  }, [scrollY]);

  const heroProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <main className="min-h-screen bg-[#f6f3ec] tracking-tight overflow-x-hidden">
      <nav className="hidden md:block fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-none top-4 w-full px-6">
        <motion.div
          className={cn(
            "mx-auto flex items-center justify-between px-6 py-3 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-auto",
            scrolled ? "max-w-4xl bg-white/80 backdrop-blur-md rounded-full border border-neutral-200/50 shadow-lg" : "max-w-[1400px] bg-transparent"
          )}
        >
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.png" alt="Afus" width={120} height={40} className="h-6 w-auto sm:h-8" priority />
            <span className="text-xl font-bold text-neutral-900">Afus</span>
          </Link>

          <div className="flex items-center gap-10">
            {["manifesto", "features", "faq"].map((item) => (
              <a key={item} href={`#${item}`} className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider">
                <span>{item}</span>
              </a>
            ))}
          </div>

          <Link href="/" className="h-10 px-6 bg-neutral-900 text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center">
            Open the app
          </Link>
        </motion.div>
      </nav>

      <header className="relative w-full overflow-hidden" style={{ height: windowHeight }}>
        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="h-full ml-0">
            {HERO_SLIDES.map((slide, index) => (
              <CarouselItem key={index} className="h-full pl-0 basis-full relative">
                {/* Background */}
                <div 
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{ background: slide.bgGradient }} 
                />
                
                {/* Arabic Text Overlay */}
                <div className="absolute inset-x-0 top-12 flex justify-center pointer-events-none select-none overflow-hidden">
                  <span className="vazirmatn-font text-[22vw] sm:text-[18vw] font-black text-[#E5C0F4]/30 leading-none whitespace-nowrap">
                    أفــوس أفــوس أفــوس
                  </span>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center px-4 pt-20">
                  <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left space-y-6 z-10">
                      <BrandStar className="h-8 w-8 text-neutral-400 mx-auto md:mx-0" />
                      <h1 className="text-5xl sm:text-7xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
                        {slide.title} <br />
                        <span className={cn(playfair.className, "italic font-normal text-primary")}>
                          {slide.highlight}
                        </span>
                      </h1>
                      <p className="text-xl text-neutral-600 leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Link href="/" className="h-14 px-8 bg-neutral-900 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-neutral-200 hover:bg-neutral-800 transition-all active:scale-[0.98] w-full sm:w-auto flex items-center justify-center">
                          <Download className="mr-2 h-5 w-5" />
                          Install the App
                        </Link>
                      </div>
                    </div>

                    <div className="relative w-full max-w-2xl aspect-square md:aspect-[4/3]">
                      <Image 
                        src={slide.image} 
                        alt="Afus app" 
                        fill 
                        className="object-contain object-center md:object-right-bottom drop-shadow-2xl" 
                        priority={index === 0}
                        sizes="(max-w-768px) 100vw, 50vw"
                        quality={90}
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </header>

      <section className="relative z-10 bg-white rounded-t-[48px] -mt-12 shadow-2xl border-t border-neutral-100 px-4 sm:px-8 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto space-y-32">
          <RevealOnScroll id="manifesto" className="text-center space-y-12">
            <span className="px-6 py-2 rounded-full border border-neutral-200 text-sm font-bold uppercase tracking-widest text-neutral-500 bg-neutral-50">Our Manifesto</span>
            <div className="space-y-8">
              <p className="text-2xl sm:text-5xl font-black text-neutral-900 leading-[1.2]">
                In a time when everything is mass-produced, our handmade heritage is fading.
              </p>
              <p className="text-xl sm:text-2xl text-neutral-600 leading-relaxed font-medium max-w-3xl mx-auto">
                We exist to connect makers with those who value their craft. This is the home where creations are honored, stories are preserved, and every purchase carries weight.
              </p>
            </div>
          </RevealOnScroll>

          <div id="features" className="space-y-16">
            <RevealOnScroll className="text-center space-y-4">
              <h2 className="text-3xl sm:text-6xl font-black text-neutral-900 tracking-tight">Crafted for Everyday Ease</h2>
              <p className="text-xl text-neutral-500 font-medium">Everything you need to discover and support local talent.</p>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { title: "Discover unique finds", desc: "Explore handmade products from real Moroccan makers.", img: "/landing/a.png", color: "text-orange-600" },
                { title: "Customized shop pages", desc: "Establish a real brand presence with a personalized page.", img: "/landing/b.png", color: "text-purple-600" },
                { title: "Dashboard for real sellers", desc: "Track sales, orders, and performance instantly.", img: "/landing/dashboard.png", color: "text-blue-600" },
                { title: "Built to convert", desc: "Smart layouts and clear details that guide shoppers to buy.", img: "/landing/d.png", color: "text-pink-600" }
              ].map((feat, i) => (
                <RevealOnScroll key={i} className="group p-2 rounded-[32px] bg-neutral-50 border border-neutral-100 hover:bg-white hover:border-neutral-200 hover:shadow-2xl transition-all duration-500">
                  <div className="p-8 space-y-4">
                    <h3 className={cn("text-2xl font-black", feat.color)}>{feat.title}</h3>
                    <p className="text-neutral-500 font-medium text-lg leading-snug">{feat.desc}</p>
                  </div>
                  <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden m-2 shadow-inner bg-white">
                    <Image 
                      src={feat.img} 
                      alt={feat.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      sizes="(max-w-768px) 100vw, 40vw"
                    />
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 px-8 py-24 rounded-t-[48px]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Image src="/icon.png" alt="Afus" width={48} height={48} className="brightness-0 invert" />
                <span className="text-3xl font-black text-white">Afus</span>
              </div>
              <p className="text-xl text-neutral-400 max-w-md font-medium">
                The home of Moroccan artisans. Empowering local talent through technology and design.
              </p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs opacity-50">Legal</h4>
              <div className="flex flex-col gap-4">
                <span className="text-neutral-400 font-bold hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                <span className="text-neutral-400 font-bold hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs opacity-50">Contact</h4>
              <div className="flex flex-col gap-4">
                <span className="text-neutral-400 font-bold">hello@afus.ma</span>
                <span className="text-neutral-400 font-bold">Casablanca, Morocco</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-24 border-t border-neutral-800 mt-24 text-center">
          <p className="text-neutral-600 font-bold uppercase tracking-widest text-[10px]">© 2026 AFUS.MA — All rights reserved</p>
        </div>
      </footer>
    </main>
  );
}
