"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter, RotateCcw } from "lucide-react";

interface SearchFiltersSheetProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

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
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Sort & Filter</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-primary">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <SheetDescription>Choose how to sort and filter results</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Sort by</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="sort"
                  value="recommended"
                  checked={currentSort === "recommended"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Recommended</span>
              </label>
              <label className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="sort"
                  value="price-asc"
                  checked={currentSort === "price-asc"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Price: Low to High</span>
              </label>
              <label className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="sort"
                  value="price-desc"
                  checked={currentSort === "price-desc"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Price: High to Low</span>
              </label>
              <label className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="sort"
                  value="newest"
                  checked={currentSort === "newest"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Newest Arrivals</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Show {resultCount} {resultCount === 1 ? "Result" : "Results"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

