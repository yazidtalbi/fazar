import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SellerPromoBanner(): React.ReactElement {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Card */}
        <div className="rounded-xl bg-gradient-to-b from-[#1b0f2b] to-[#12071f] px-10 py-12 sm:px-14 sm:py-16 lg:px-10 lg:py-10 ">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left */}
            <div className="max-w-xl">
              <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Dive into the world of handmade
            
              </h2>

              <p className="mt-8 max-w-md text-base leading-relaxed  sm:text-lg text-[#F3E2F5]">
                Turn your craft into income. Create your shop, add your products,
                and start selling to buyers across Morocco .
              </p>

              <div className="mt-10">
                <button
                  type="button"
                  className="inline-flex items-center justify-center !rounded-full bg-white px-8 py-3 text-sm font-bold text-[#160a23]  transition hover:opacity-95 active:opacity-90 sm:text-base"
                >
                  Become a seller now
                </button>
              </div>
            </div>

            {/* Right (image placeholder) */}
            <div className="flex justify-center lg:justify-end">
              <div className="  aspect-square "  />
    
                  <img
                    src="/seller.png"
                    alt=""
                    className="h-72 mx-auto"
                  />
            
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

