"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps): React.ReactElement {
  function handleDecrease() {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function handleIncrease() {
    if (value < max) {
      onChange(value + 1);
    }
  }

  return (
    <div className={cn("flex items-center border bg-background", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrease}
        disabled={value <= min}
        className="h-10 w-10"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="w-12 text-center font-medium">{value}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrease}
        disabled={value >= max}
        className="h-10 w-10"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

