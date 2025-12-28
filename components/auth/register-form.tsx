"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Failed to create account");
      setIsLoading(false);
      return;
    }

    // Create buyer or seller profile
    if (userType === "buyer") {
      const { error: profileError } = await supabase
        .from("buyer_profiles")
        .insert({ id: authData.user.id });

      if (profileError) {
        console.error("Failed to create buyer profile:", profileError);
      }
    } else {
      const { error: profileError } = await supabase
        .from("seller_profiles")
        .insert({ id: authData.user.id });

      if (profileError) {
        console.error("Failed to create seller profile:", profileError);
      }
    }

    router.push("/onboarding/mode");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marhaba</CardTitle>
        <CardDescription>Enter your details to join the souk.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>I WANT TO</Label>
            <div className="flex gap-2 border border-border p-1 bg-muted">
              <button
                type="button"
                onClick={() => setUserType("buyer")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  userType === "buyer"
                    ? "bg-background text-foreground border border-border"
                    : "text-muted-foreground"
                }`}
              >
                BUYER
              </button>
              <button
                type="button"
                onClick={() => setUserType("seller")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  userType === "seller"
                    ? "bg-background text-foreground border border-border"
                    : "text-muted-foreground"
                }`}
              >
                SELLER
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">EMAIL ADDRESS</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">PASSWORD</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "CONTINUE →"}
          </Button>
        </form>
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR CONTINUE WITH</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="w-full">
              G Google
            </Button>
            <Button variant="outline" type="button" className="w-full">
              Apple
            </Button>
          </div>
        </div>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Have an account?{" "}
            <a href="/auth/login" className="text-primary underline">
              Log In
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary underline">Terms of Service</a> and{" "}
            <a href="#" className="text-primary underline">Privacy Policy</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

