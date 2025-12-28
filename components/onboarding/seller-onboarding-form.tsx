"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SellerOnboardingForm(): React.ReactElement {
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/store/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      setError(data.error || "Failed to create store");
      setIsLoading(false);
      return;
    }

    router.push("/seller");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, Artisan</CardTitle>
        <CardDescription>
          Let's start with your profile basics to get you verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">STORE NAME</Label>
            <Input
              id="storeName"
              placeholder="e.g. Atlas Weavers Collective"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              minLength={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be your shop's public name
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "CONTINUE →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

