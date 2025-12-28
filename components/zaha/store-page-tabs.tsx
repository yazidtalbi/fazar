"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StorePageTabsProps {
  store: any;
  products: any[];
}

export function StorePageTabs({ store, products }: StorePageTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState("shop");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent border-b">
        <TabsTrigger value="shop" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
          SHOP
        </TabsTrigger>
        <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
          ABOUT
        </TabsTrigger>
        <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
          REVIEWS
        </TabsTrigger>
      </TabsList>

      <TabsContent value="shop" className="mt-6">
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No products available</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <Link key={product.id} href={`/p/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0">
                  <div className="relative aspect-square w-full bg-muted">
                    {product.cover_media && (
                      <Image
                        src={product.cover_media}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        MAD {Number(product.price).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <div className="space-y-4">
          {store.description ? (
            <p className="text-sm whitespace-pre-line">{store.description}</p>
          ) : (
            <p className="text-muted-foreground">No description available.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

