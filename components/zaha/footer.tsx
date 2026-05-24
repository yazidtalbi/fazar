import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

export function Footer(): React.ReactElement {
  return (
    <footer className="text-white rounded-t-3xl" style={{ backgroundColor: '#1D0D2C' }}>
      <div className="max-w-[100rem] mx-auto px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-y-8 md:gap-x-20 mb-12">
          {/* Left Column - Branding */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/icon2.png"
                alt="Afus Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <Image
                src="/afus.svg"
                alt="Afus Logotype"
                width={56}
                height={20}
                className="h-4 w-auto brightness-0 invert"
              />
            </div>

            {/* Description */}
            <p className="text-base text-white/80 mb-8 max-w-md">
              Afus est une marketplace de produits artisanaux marocains authentiques. Découvrez des créations faites main ou partagez vos propres créations avec le monde.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3 mt-8">
              <Link
                href="https://www.instagram.com/afus_ma/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Afus Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 font-ariom">Afus</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  À propos d&apos;Afus
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
            </ul>
          </div>

          {/* For shopping Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 font-ariom">Pour les achats</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  Rechercher des produits
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white/80 hover:text-white transition-colors">
                  Mon panier
                </Link>
              </li>
              <li>
                <Link href="/search?category=sale" className="text-white/80 hover:text-white transition-colors">
                  Meilleures offres
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-white/80 hover:text-white transition-colors">
                  Mes commandes
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-white/80 hover:text-white transition-colors">
                  Mes favoris
                </Link>
              </li>
            </ul>
          </div>

          {/* For business Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 font-ariom">Pour les vendeurs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/onboarding/seller" className="text-white/80 hover:text-white transition-colors">
                  Devenir vendeur
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-white/80 hover:text-white transition-colors">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/seller/products" className="text-white/80 hover:text-white transition-colors">
                  Mes produits
                </Link>
              </li>
              <li>
                <Link href="/seller/orders" className="text-white/80 hover:text-white transition-colors">
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 font-ariom">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  Aide
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-white/80 hover:text-white transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-white/80 hover:text-white transition-colors">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-white/80" suppressHydrationWarning>
              {new Date().getFullYear()} © Afus. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

