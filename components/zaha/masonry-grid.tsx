"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function MasonryGrid({
  children,
  className,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
}: MasonryGridProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use CSS columns for masonry effect
    const container = containerRef.current;
    const style = window.getComputedStyle(container);
    const width = container.offsetWidth;

    let columnCount = columns.mobile || 2;
    if (width >= 1024) {
      columnCount = columns.desktop || 4;
    } else if (width >= 768) {
      columnCount = columns.tablet || 3;
    }

    container.style.columnCount = columnCount.toString();
    container.style.columnGap = "1rem";
    container.style.columnFill = "balance";
  }, [columns]);

  return (
    <div
      ref={containerRef}
      className={cn("masonry-grid", className)}
      style={{
        columnCount: "auto",
        columnGap: "1rem",
      }}
    >
      <style jsx>{`
        .masonry-grid > * {
          break-inside: avoid;
          margin-bottom: 1rem;
          display: inline-block;
          width: 100%;
        }
      `}</style>
      {children}
    </div>
  );
}

