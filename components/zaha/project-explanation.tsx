import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Heart } from "lucide-react";

export async function ProjectExplanation(): Promise<React.ReactElement> {
  const supabase = await createClient();

  // Fetch featured stores with their first product image
  const { data: stores } = await supabase
    .from("stores")
    .select(`
      id,
      name,
      slug,
      logo_url,
      cover_image_url,
      city,
      products(
        id,
        status,
        product_media(media_url, is_cover, order_index)
      )
    `)
    .limit(10);

  // Filter stores that have active products and get first product image
  const storesWithActiveProducts = (stores || []).filter((store: any) => {
    const activeProducts = (store.products || []).filter((p: any) => p.status === "active");
    return activeProducts.length > 0;
  }).slice(0, 3);

  const storesWithImages = storesWithActiveProducts.map((store: any) => {
    const activeProducts = (store.products || []).filter((p: any) => p.status === "active");
    const firstProduct = activeProducts[0];
    const mediaArray = firstProduct?.product_media || [];
    const coverMedia = mediaArray.find((m: any) => m.is_cover) || mediaArray[0];
    
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo_url: store.logo_url,
      cover_image_url: store.cover_image_url,
      city: store.city,
      product_image: coverMedia?.media_url || null,
    };
  });

  return (
    <section className="hidden md:block relative overflow-hidden rounded-xl" style={{ backgroundColor: '#fef8ec' }}>
      <div className="max-w-[100rem] mx-auto px-12 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900">Qu&apos;est-ce qu&apos;Afus ?</h2>
          <Link 
            href="/search" 
            className="text-sm text-neutral-700 underline hover:text-neutral-900 transition-colors"
          >
            Découvrez notre merveilleuse histoire
          </Link>
        </div>

        {/* Main Content - Centered */}
        <div className="max-w-4xl mx-auto space-y-6 mb-12">
          {/* Text Content */}
          <div className="space-y-6">
            {/* Introduction */}
            <div>
              <p className="text-lg text-neutral-800 mb-4">
                Bienvenue sur Afus, la marketplace en ligne où vous achetez directement auprès de créateurs passionnés.
              </p>
              <p className="text-lg text-neutral-800 mb-4">
                Une plateforme qui célèbre l&apos;expression artistique et la créativité
              </p>
              <p className="text-base text-neutral-700 leading-relaxed">
                Ici, les artisans du monde entier se rassemblent pour partager leurs créations avec plus de 88 millions d&apos;acheteurs passionnés. Produits artisanaux, décoration vintage, accessoires à offrir et vêtements faits main : Afus est la parfaite destination pour découvrir des articles exceptionnels, soutenir l&apos;achat local et le savoir-faire des vendeurs indépendants.
              </p>
            </div>

            {/* Three Sections */}
            <div className="space-y-6">
              {/* Pourquoi choisir Afus ? */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Pourquoi choisir Afus ?</h3>
                <p className="text-base text-neutral-700 leading-relaxed">
                  Afus offre une sélection unique de produits artisanaux et créatifs. Chaque achat soutient directement les créateurs indépendants et leur permet de continuer à partager leur passion avec le monde.
                </p>
              </div>

              {/* Pourquoi faire confiance à Afus ? */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Pourquoi faire confiance à Afus ?</h3>
                <p className="text-base text-neutral-700 leading-relaxed">
                  Afus garantit la sécurité de vos transactions et la protection de vos données. Notre plateforme met en place des mesures de sécurité avancées pour assurer une expérience d&apos;achat en toute confiance.
                </p>
              </div>

              {/* Comment devenir vendeur Afus ? */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Comment devenir vendeur Afus ?</h3>
                <p className="text-base text-neutral-700 leading-relaxed">
                  Bonne nouvelle : notre plateforme est ouverte à tous ! Que vous soyez artisan indépendant, créateur de produits uniques, ou petite entreprise, vous pouvez commencer à vendre sur Afus dès aujourd&apos;hui.
                </p>
              </div>
            </div>

            {/* Help Center Button */}
            <div className="pt-4 text-center">
              <p className="text-lg mb-4 text-neutral-800">
                Vous avez une question ? Ça tombe bien, nous avons des réponses.
              </p>
              <Link href="/search">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50 px-6 py-3"
                >
                  Voir le Centre d&apos;aide
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Store Cards - Centered */}
        <div className="flex gap-4 justify-center max-w-4xl mx-auto">
          {storesWithImages.map((store) => (
            <Link 
              key={store.id} 
              href={`/store/${store.slug}`}
              className="flex-1 bg-white rounded-2xl overflow-hidden hover:border-primary/30 transition-colors border border-border"
            >
              <div className="relative aspect-square w-full bg-muted">
                {store.product_image ? (
                  <Image
                    src={store.product_image}
                    alt={store.name}
                    fill
                    className="object-cover rounded-t-2xl"
                    sizes="(max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
                {/* Heart icon */}
                <button
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-all z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Heart className="h-4 w-4 text-gray-700" />
                </button>
              </div>
              <div className="p-4">
                {/* Store Logo */}
                {store.logo_url && (
                  <div className="relative w-12 h-12 rounded-full bg-muted overflow-hidden mb-3 border-2 border-white">
                    <Image
                      src={store.logo_url}
                      alt={store.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                {/* Store Name */}
                <h3 className="font-semibold text-sm text-neutral-900">{store.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

