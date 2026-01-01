import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter } from "lucide-react";

export function Footer(): React.ReactElement {
  return (
    <footer className="text-white" style={{ backgroundColor: '#1D0D2C' }}>
      <div className="max-w-[100rem] mx-auto px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-y-8 md:gap-x-20 mb-12">
          {/* Left Column - Branding */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/icon.png"
                alt="Afus"
                width={120}
                height={40}
                className="h-6 w-auto"
              />
              <span className="text-xl font-bold">Afus</span>
            </div>

            {/* Description */}
            <p className="text-base text-white/80 mb-8 max-w-md">
              Afus est une marketplace de produits artisanaux marocains authentiques. Découvrez des créations faites main ou partagez vos propres créations avec le monde.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3 mt-8">
              <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Facebook">
                <span className="text-sm font-bold">f</span>
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Afus Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4">Afus</h3>
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
            <h3 className="font-bold mb-4">Pour les achats</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  Rechercher des produits
                </Link>
              </li>
              <li>
                <Link href="/app/cart" className="text-white/80 hover:text-white transition-colors">
                  Mon panier
                </Link>
              </li>
              <li>
                <Link href="/search?category=sale" className="text-white/80 hover:text-white transition-colors">
                  Meilleures offres
                </Link>
              </li>
              <li>
                <Link href="/app/orders" className="text-white/80 hover:text-white transition-colors">
                  Mes commandes
                </Link>
              </li>
              <li>
                <Link href="/app/saved" className="text-white/80 hover:text-white transition-colors">
                  Mes favoris
                </Link>
              </li>
            </ul>
          </div>

          {/* For business Column */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4">Pour les vendeurs</h3>
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
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-white/80 hover:text-white transition-colors">
                  Aide
                </Link>
              </li>
              <li>
                <Link href="/app/messages" className="text-white/80 hover:text-white transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/app/profile" className="text-white/80 hover:text-white transition-colors">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-white/80">
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

