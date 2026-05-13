"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { X, ShoppingBag, User, Chrome, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
    router.push("/checkout");
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onOpenChange(false);
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
              {mode === "checkout" ? (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <DialogHeader className="text-left space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-6 w-6 text-neutral-900" />
                    </div>
                    <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                      Checkout
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-base leading-relaxed">
                      Choose how you want to proceed with your order.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Button
                      onClick={handleContinueAsGuest}
                      className="w-full h-14 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
                    >
                      Continue as Guest
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                        <span className="bg-white px-4 text-neutral-400">or sign in to your account</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setMode("login")}
                        className="h-14 border-neutral-200 rounded-xl hover:bg-neutral-50 font-bold transition-all"
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMode("register")}
                        className="h-14 border-neutral-200 rounded-xl hover:bg-neutral-50 font-bold transition-all"
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : mode === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <DialogHeader className="text-left space-y-2 mb-8">
                    <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                      Welcome back
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-base">
                      Enter your credentials to continue to checkout.
                    </DialogDescription>
                  </DialogHeader>
                  <LoginForm onSuccess={handleSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <DialogHeader className="text-left space-y-2 mb-8">
                    <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                      Create account
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-base">
                      Join us for a faster checkout experience next time.
                    </DialogDescription>
                  </DialogHeader>
                  <RegisterForm onSuccess={handleSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2">
            {mode === "checkout" ? (
              <p className="text-[11px] text-center text-neutral-500 leading-relaxed">
                Need help? <Link href="#" className="underline font-medium hover:text-neutral-900">Contact Support</Link>
              </p>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

