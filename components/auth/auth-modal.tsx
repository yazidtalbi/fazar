"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    // Use window.location.href for a hard refresh which is more reliable for auth state changes
    window.location.href = "/";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[24px]">
        <div className="relative">
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-all hover:bg-neutral-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-8 pt-10 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <DialogHeader className="text-left space-y-2 mb-8">
                  <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                    {mode === "login" ? "Welcome back" : "Create account"}
                  </DialogTitle>
                  <DialogDescription className="text-neutral-500 text-base">
                    {mode === "login" 
                      ? "Enter your credentials to access your account" 
                      : "Join our community of authentic Moroccan makers"}
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-y-auto pr-2 scrollbar-hide">
                  {mode === "login" ? (
                    <LoginForm onSuccess={handleSuccess} />
                  ) : (
                    <RegisterForm onSuccess={handleSuccess} />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2">
            <span className="text-sm text-neutral-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <Button
              variant="link"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm font-semibold text-primary p-0 hover:no-underline hover:text-primary/80"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

