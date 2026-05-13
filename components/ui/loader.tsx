"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  variant?: "default" | "premium";
}

export function Loader({ size = 24, variant = "default", className, ...props }: LoaderProps) {
  if (variant === "premium") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
        <div className="relative flex items-center justify-center">
          <div className="absolute h-12 w-12 rounded-full border-t-2 border-primary animate-[spin_1.5s_linear_infinite]" />
          <div className="absolute h-12 w-12 rounded-full border-r-2 border-primary/30 animate-[spin_2s_linear_infinite]" />
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
          Loading Afus...
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 
        className="animate-spin text-neutral-400" 
        size={size} 
      />
    </div>
  );
}
