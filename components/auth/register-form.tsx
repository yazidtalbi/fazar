"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
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

    // Create buyer profile by default
    const { error: profileError } = await supabase
      .from("buyer_profiles")
      .insert({ id: authData.user.id });

    if (profileError) {
      console.error("Failed to create buyer profile:", profileError);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/onboarding/mode");
      router.refresh();
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2 text-neutral-900">Créez votre compte</h1>
      <p className="text-sm text-neutral-600 mb-6">Inscrivez-vous en toute simplicité.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-neutral-900">
            Adresse email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="firstName" className="text-sm font-medium text-neutral-900">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="border-2 border-neutral-900 rounded-xl bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-neutral-900">
            Mot de passe <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border-2 border-neutral-900 rounded-xl bg-white"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <div className="text-sm text-neutral-700 mb-4">
          En cliquant sur S&apos;inscrire ou Continuer avec Google, Facebook, ou Apple, vous acceptez de respecter les{" "}
          <Link href="#" className="text-blue-600 underline hover:text-blue-800">Conditions d&apos;utilisation</Link> et le{" "}
          <Link href="#" className="text-blue-600 underline hover:text-blue-800">Règlement concernant la confidentialité</Link> d&apos;Afus.
        </div>

        <Button 
          type="submit" 
          className="w-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300 rounded-xl py-3 font-medium" 
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "S&apos;inscrire"}
        </Button>
      </form>

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
          <span className="text-xl font-bold text-blue-600">G</span>
          Continuer avec Google
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl font-bold text-blue-600">f</span>
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

      <div className="mt-6 text-xs text-neutral-600">
        <p>
          Afus peut vous envoyer des messages ; vous pouvez modifier vos préférences à cet égard dans les paramètres de votre compte. Nous ne publierons jamais sans votre autorisation.
        </p>
      </div>
    </div>
  );
}
