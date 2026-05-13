"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersSheetProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest Arrivals" },
];

export function SearchFiltersSheet({ currentSort, onSortChange, resultCount }: SearchFiltersSheetProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  function handleSortChange(sort: string) {
    onSortChange(sort);
    setOpen(false);
  }

  function handleReset() {
    onSortChange("recommended");
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 transition-all">
          <Filter className="h-5 w-5 text-neutral-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[32px] px-8 pt-8 pb-10 border-none shadow-2xl">
        <SheetHeader className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold tracking-tight text-neutral-900">Sort & Filter</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset} 
              className="text-primary hover:bg-primary/5 rounded-full font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Reset
            </Button>
          </div>
          <SheetDescription className="text-neutral-500 text-base">
            Refine your search results to find exactly what you&apos;re looking for.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Sort by</h3>
            <div className="grid gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSortChange(option.id)}
                  className={cn(
                    "flex items-center justify-between w-full p-4 rounded-[16px] transition-all border-2",
                    currentSort === option.id 
                      ? "bg-primary/5 border-primary text-primary" 
                      : "bg-neutral-50 border-transparent text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <span className="font-semibold">{option.label}</span>
                  {currentSort === option.id && <Check className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button 
            className="w-full h-14 bg-neutral-900 text-white hover:bg-neutral-800 rounded-[18px] text-lg font-bold shadow-xl shadow-neutral-200 transition-all active:scale-[0.98]" 
            onClick={() => setOpen(false)}
          >
            Show {resultCount} {resultCount === 1 ? "Result" : "Results"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

