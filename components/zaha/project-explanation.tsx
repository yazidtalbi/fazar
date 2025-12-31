import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectExplanation(): React.ReactElement {
  return (
    <div className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What is ANDALUS?</h2>
          <Link 
            href="/search" 
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Read our wonderful and strange story
          </Link>
        </div>

        {/* Three Columns */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Left Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">A community with positive impact</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              ANDALUS is an online marketplace where people create, sell, buy, and collect unique items. 
              We are a community aiming for positive changes for small businesses, individuals, and the planet.
            </p>
            <Link 
              href="/search" 
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Here are some examples of the positive impact we generate together.
            </Link>
          </div>

          {/* Middle Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support for independent creators</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ANDALUS does not have a warehouse but connects millions of individuals who sell what they love. 
              We facilitate direct contact between buyers and creators to discover extraordinary items.
            </p>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Peace of mind</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ANDALUS places high importance on data confidentiality. 
              Assistance is readily available if needed.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg mb-6">
            Do you have a question? That&apos;s good, we have answers.
          </p>
          <Link href="/search">
            <Button variant="outline" className="uppercase">
              See the Help Center
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

