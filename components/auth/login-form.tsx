"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Lock, Chrome, Facebook, Apple } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      window.location.href = "/";
    }
  }

  async function handleSocialLogin(provider: "google" | "facebook" | "apple") {
    setIsLoading(true);
    setError(null);
    
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (socialError) {
      setError(socialError.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
            <Link href="#" className="text-xs text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              <span>Signing in...</span>
            </div>
          ) : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
          <span className="bg-white px-4 text-neutral-400">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Chrome className="h-5 w-5" />
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading}
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Facebook className="h-5 w-5 text-[#1877F2]" />
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSocialLogin("apple")}
          disabled={isLoading}
          className="h-11 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          <Apple className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-[11px] text-center text-neutral-500 leading-relaxed">
        By continuing, you agree to Afus&apos;s{" "}
        <Link href="#" className="underline hover:text-neutral-900">Terms of Service</Link> and{" "}
        <Link href="#" className="underline hover:text-neutral-900">Privacy Policy</Link>.
      </p>
    </div>
  );
}
