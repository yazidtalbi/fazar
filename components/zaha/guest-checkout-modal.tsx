"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GuestCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

export function GuestCheckoutModal({ 
  open, 
  onOpenChange, 
  onContinueAsGuest 
}: GuestCheckoutModalProps): React.ReactElement {
  const [mode, setMode] = useState<"checkout" | "login" | "register">("checkout");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
    router.push("/app/checkout");
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onOpenChange(false);
  };

  if (mode === "login") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold text-neutral-900">
              Connexion
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <LoginForm onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === "register") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold text-neutral-900">
              S&apos;inscrire
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <RegisterForm onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-neutral-900">
              Finaliser la commande
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Continue as Guest Button */}
          <Button
            onClick={handleContinueAsGuest}
            variant="outline"
            className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium"
          >
            Continuer en tant qu&apos;invité
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-600">OU</span>
            </div>
          </div>

          {/* Login/Signup Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neutral-900">
              Connectez-vous ou inscrivez-vous
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-email" className="text-sm font-medium text-neutral-900">
                  Adresse email
                </Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-neutral-900 rounded-xl bg-white"
                  placeholder="Votre email"
                />
              </div>

              <div className="text-xs text-neutral-700 space-y-2">
                <p>
                  En cliquant sur Poursuivre ou Continuer avec Google, Facebook, ou Apple, vous acceptez de respecter les{" "}
                  <Link href="#" className="text-blue-600 underline hover:text-blue-800">
                    Conditions d&apos;utilisation
                  </Link>{" "}
                  et le{" "}
                  <Link href="#" className="text-blue-600 underline hover:text-blue-800">
                    Règlement concernant la confidentialité
                  </Link>{" "}
                  d&apos;Afus.
                </p>
              </div>

              <Button
                onClick={() => setMode("login")}
                className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl py-3 font-medium"
              >
                Poursuivre
              </Button>

              <div className="text-center">
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900 underline"
                >
                  Vous n&apos;arrivez pas à vous connecter ?
                </Link>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-600">OU</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("login")}
              className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl font-bold">G</span>
              Continuer avec Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("login")}
              className="w-full border-2 border-neutral-900 rounded-xl bg-white text-neutral-900 hover:bg-neutral-50 py-3 font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl font-bold">f</span>
              Continuer avec Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

