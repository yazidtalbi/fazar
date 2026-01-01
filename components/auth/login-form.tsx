"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayConnected, setStayConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/app");
      router.refresh();
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2 text-neutral-900">Connectez-vous pour continuer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-neutral-900">Adresse email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-2 border-neutral-900 rounded-xl bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-neutral-900">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-2 border-neutral-900 rounded-xl bg-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="stayConnected"
              checked={stayConnected}
              onChange={(e) => setStayConnected(e.target.checked)}
              className="w-4 h-4 border-2 border-neutral-900 rounded"
            />
            <Label htmlFor="stayConnected" className="text-sm text-neutral-700 cursor-pointer">
              Rester connecté
            </Label>
          </div>
          <Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900 underline">
            Mot de passe oublié ?
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl py-3 font-medium" 
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "Se connecter"}
        </Button>
      </form>

      <div className="mt-6">
        <Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900 underline">
          Vous n&apos;arrivez pas à vous connecter ?
        </Link>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-neutral-600">OU</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl font-bold">G</span>
          Continuer avec Google
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl font-bold">f</span>
          Continuer avec Facebook
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl">🍎</span>
          Continuer avec Apple
        </Button>
      </div>

      <div className="mt-6 text-sm text-neutral-700 space-y-2">
        <p>
          En cliquant sur Se connecter, Continuer avec Google, Facebook, ou Apple, vous acceptez de respecter les{" "}
          <Link href="#" className="underline hover:text-neutral-900">Conditions d&apos;utilisation</Link> et le{" "}
          <Link href="#" className="underline hover:text-neutral-900">Règlement concernant la confidentialité</Link> d&apos;Afus.
        </p>
        <p className="text-xs text-neutral-600">
          Afus peut vous envoyer des messages ; vous pouvez modifier vos préférences à cet égard dans les paramètres de votre compte. Nous ne publierons jamais sans votre autorisation.
        </p>
      </div>
    </div>
  );
}
