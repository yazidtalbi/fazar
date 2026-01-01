"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ open, onOpenChange, initialMode = "login" }: AuthModalProps): React.ReactElement {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold text-neutral-900">
            {mode === "login" ? "Connexion" : "S'inscrire"}
          </DialogTitle>
          <div className="flex items-center gap-4">
            {mode === "login" ? (
              <Button
                variant="ghost"
                onClick={() => setMode("register")}
                className="text-sm text-neutral-900 hover:text-neutral-900 hover:bg-transparent"
              >
                S&apos;inscrire
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setMode("login")}
                className="text-sm text-neutral-900 hover:text-neutral-900 hover:bg-transparent"
              >
                Se connecter
              </Button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {mode === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

