"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import Link from "next/link";

export function CreditsBalance(): React.ReactElement {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchBalance() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/credits/balance");
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch credits balance:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBalance();

    const handleCreditsUpdate = () => {
      fetchBalance();
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);
    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Credits</span>
            </div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium">Credits Balance</span>
              <p className="text-2xl font-bold">{Number(balance || 0).toFixed(2)} MAD</p>
            </div>
          </div>
          <Link href="/seller/credits">
            <Button size="sm" variant="outline">
              Buy Credits
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

