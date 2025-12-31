import Link from "next/link";
import Image from "next/image";

interface ProductAdBannerProps {
  product?: {
    id: string;
    title: string;
    imageUrl?: string;
    category?: string;
  };
}

export function ProductAdBanner({ product }: ProductAdBannerProps): React.ReactElement {
  // Default product data if none provided
  const defaultProduct = {
    id: "1",
    title: "Calendriers 2026",
    category: "Calendriers 2026",
    imageUrl: null,
  };

  const displayProduct = product || defaultProduct;

  return (
    <Link href={`/search?category=${displayProduct.category?.toLowerCase() || "calendars"}`}>
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
        {/* Product Image/Illustration */}
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
          {displayProduct.imageUrl ? (
            <Image
              src={displayProduct.imageUrl}
              alt={displayProduct.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-2xl font-bold text-gray-800">{displayProduct.title}</p>
            </div>
          )}
          
          {/* Overlay with text */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {displayProduct.category || displayProduct.title}
            </h3>
            <p className="text-white/90 text-sm">Parcourir maintenant</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

