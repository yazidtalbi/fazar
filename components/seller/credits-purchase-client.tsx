"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Coins, Check } from "lucide-react";

interface CreditPackage {
  id: string;
  name: string;
  credits_amount: number;
  price_mad: number;
  bonus_credits: number;
  order_index: number;
}

export function CreditsPurchaseClient(): React.ReactElement {
  const router = useRouter();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [packagesRes, balanceRes] = await Promise.all([
          fetch("/api/credits/packages"),
          fetch("/api/credits/balance"),
        ]);

        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          setPackages(packagesData.packages || []);
        }

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData.balance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load credit packages");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handlePurchase(packageId: string) {
    setPurchasingId(packageId);
    try {
      // TODO: In a real implementation, this would redirect to a payment gateway
      // For now, we'll simulate the purchase
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase credits");
      }

      toast.success(`Successfully purchased ${data.creditsAdded.toFixed(2)} credits!`);
      setBalance(data.balance);
      // Dispatch event to update balance elsewhere
      window.dispatchEvent(new CustomEvent("creditsUpdated"));
      router.refresh();
    } catch (error: any) {
      console.error("Error purchasing credits:", error);
      toast.error(error.message || "Failed to purchase credits");
    } finally {
      setPurchasingId(null);
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading credit packages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <Coins className="h-8 w-8 text-primary" />
                {Number(balance || 0).toFixed(2)} MAD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => {
            const totalCredits = Number(pkg.credits_amount) + Number(pkg.bonus_credits);
            const savings = pkg.bonus_credits > 0 ? ((pkg.bonus_credits / totalCredits) * 100).toFixed(0) : 0;

            return (
              <Card key={pkg.id} className="relative">
                {savings > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500">
                    {savings}% Bonus
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>
                    {totalCredits.toFixed(2)} credits
                    {pkg.bonus_credits > 0 && (
                      <span className="text-green-600 ml-1">
                        (+{pkg.bonus_credits.toFixed(2)} bonus)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{pkg.price_mad.toFixed(2)} MAD</div>
                    <div className="text-sm text-muted-foreground">
                      {(pkg.price_mad / totalCredits).toFixed(2)} MAD per credit
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasingId === pkg.id}
                  >
                    {purchasingId === pkg.id ? "Processing..." : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How Credits Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <p>Purchase credits to promote your products and boost visibility</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <p>Promoted products appear prominently in search results and category pages</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <p>Credits are deducted when you promote a product for a selected duration</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <p>Promotion pricing: 10 MAD per day (minimum 1 day, maximum 30 days)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

