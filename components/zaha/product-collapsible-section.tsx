"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ProductCollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: ProductCollapsibleSectionProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <h3 className="font-semibold">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-primary" />
        )}
      </button>
      {isOpen && <div className="pb-4 text-sm text-muted-foreground whitespace-pre-line">{children}</div>}
    </div>
  );
}

