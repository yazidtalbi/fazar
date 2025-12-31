import Link from "next/link";

export function Footer(): React.ReactElement {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* About ANDALUS */}
          <div>
            <h3 className="font-bold uppercase mb-4">About ANDALUS</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ANDALUS connects you with authentic Moroccan artisans, promoting fair trade, heritage, and craftsmanship. 
              Discover unique handmade treasures or share your creations with the world.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  ANDALUS Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-bold uppercase mb-4">Sell</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sell on ANDALUS
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors">
                  Forums
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors">
                  Affiliates
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold uppercase mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trust and Safety
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-bold">ANDALUS</span> © {new Date().getFullYear()} Andalus, Inc.
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms of Use
              </Link>
              <span>|</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>|</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Interest-based ads
              </Link>
              <span>|</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Regions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

