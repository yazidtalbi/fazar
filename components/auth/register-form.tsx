"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, User, Lock, Chrome, Facebook, Apple } from "lucide-react";
import { Loader } from "@/components/ui/loader";

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
    }
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="Your name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all h-11 rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all h-11 rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-semibold shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader size={18} className="text-white" />
              <span>Creating account...</span>
            </div>
          ) : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
          <span className="bg-white px-4 text-neutral-400">or join with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Chrome className="h-5 w-5" />
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Facebook className="h-5 w-5 text-[#1877F2]" />
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Apple className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-[11px] text-center text-neutral-500 leading-relaxed">
        By joining, you agree to Afus&apos;s{" "}
        <Link href="#" className="underline hover:text-neutral-900">Terms of Service</Link> and{" "}
        <Link href="#" className="underline hover:text-neutral-900">Privacy Policy</Link>.
      </p>
    </div>
  );
}
