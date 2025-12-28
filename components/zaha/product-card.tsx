import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { format } from "date-fns";
import { addDays } from "date-fns";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  product_media: Array<{
    media_url: string;
    media_type: "image" | "video";
    is_cover: boolean;
    order_index: number;
  }>;
  stores: {
    name: string;
    slug: string;
  };
};

interface ProductCardProps {
  product: Product;
}

function EstimatedReadyDate({ daysToCraft }: { daysToCraft: number }): React.ReactElement {
  if (daysToCraft === 0) return <span className="text-xs text-muted-foreground">Ready now</span>;
  
  const readyDate = addDays(new Date(), daysToCraft);
  return (
    <span className="text-xs text-muted-foreground">
      Ready by {format(readyDate, "EEE, d MMM")}
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  const mediaArray = Array.isArray(product.product_media) ? product.product_media : [];
  const coverMedia = mediaArray.find((m) => m.is_cover) || mediaArray[0];
  const priceFormatted = `${Number(product.price).toLocaleString()} ${product.currency || "MAD"}`;

  return (
    <Link href={`/p/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square w-full bg-muted">
          {coverMedia?.media_url ? (
            <Image
              src={coverMedia.media_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_promoted && (
              <Badge variant="default" className="text-xs">
                Promoted
              </Badge>
            )}
            {product.is_trending && (
              <Badge variant="secondary" className="text-xs">
                Trending
              </Badge>
            )}
          </div>
          {product.days_to_craft > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">
                {product.days_to_craft} days
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
          {product.stores && (
            <p className="text-xs text-muted-foreground mb-2">Artisan: {product.stores.name}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">{priceFormatted}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

