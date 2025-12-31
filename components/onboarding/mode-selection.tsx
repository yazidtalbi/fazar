"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export function ModeSelection(): React.ReactElement {
  const router = useRouter();

  function handleSelectMode(mode: "buyer" | "seller") {
    if (mode === "buyer") {
      router.push("/app");
    } else {
      router.push("/onboarding/seller");
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className="cursor-pointer hover:border-primary/30 transition-colors overflow-hidden border-0"
        onClick={() => handleSelectMode("buyer")}
      >
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="absolute top-4 left-4">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">The Bazaar</CardTitle>
          <CardDescription className="text-base">
            Discover authentic handmade treasures from skilled artisans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => handleSelectMode("buyer")}>
            SHOP NOW
          </Button>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:border-primary/30 transition-colors overflow-hidden border-0"
        onClick={() => handleSelectMode("seller")}
      >
        <div className="relative h-48 bg-gradient-to-br from-secondary/20 to-secondary/5">
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">The Workshop</CardTitle>
          <CardDescription className="text-base">
            Open your shop and share your craft with the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => handleSelectMode("seller")}>
            START SELLING
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

