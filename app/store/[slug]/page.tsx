import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorePageTabs } from "@/components/zaha/store-page-tabs";
import { StoreContactSheet } from "@/components/zaha/store-contact-sheet";
import { ArrowLeft, Search, Share2, MapPin, ShoppingCart } from "lucide-react";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select(`
      *,
      seller_profiles(is_verified)
    `)
    .eq("slug", slug)
    .single();

  if (error || !store) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      currency,
      status,
      is_promoted,
      is_trending,
      days_to_craft,
      product_media(media_url, media_type, order_index, is_cover)
    `)
    .eq("store_id", store.id)
    .eq("status", "active")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false });

  // Get cover media for products
  const productsWithCover = (products || []).map((product) => {
    const media = product.product_media as Array<{
      media_url: string;
      media_type: string;
      order_index: number;
      is_cover: boolean;
    }>;
    const coverMedia = media.find((m) => m.is_cover) || media[0];
    return {
      ...product,
      cover_media: coverMedia?.media_url || null,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/app">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold uppercase">{store.name.toUpperCase().split(' ').slice(0, 2).join(' ')}</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Link href="/app/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      {store.cover_url && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={store.cover_url}
            alt={store.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Store Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{store.name}</h2>
              {(store.seller_profiles as { is_verified: boolean } | null)?.is_verified && (
                <Badge variant="outline">Verified</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span>Marrakech, Morocco</span>
            </div>
            <Button className="mb-4">FOLLOW</Button>
            {store.description && (
              <p className="text-sm mb-4">{store.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm mb-6">
          <div>
            <span className="font-semibold">1.2k</span> items sold
          </div>
          <div>
            <span className="font-semibold">4.9</span> ★ rating
          </div>
          <div>
            <span className="font-semibold">2h</span> reply time
          </div>
        </div>

        {/* Tabs */}
        <StorePageTabs store={store} products={productsWithCover} />

        {/* Contact Seller Button */}
        <div className="sticky bottom-0 bg-background border-t p-4 mt-8">
          <StoreContactSheet store={store}>
            <Button className="w-full" size="lg">
              CONTACT SELLER
            </Button>
          </StoreContactSheet>
        </div>
      </div>
    </div>
  );
}

