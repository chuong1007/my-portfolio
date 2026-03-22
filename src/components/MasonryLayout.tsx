"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Pseudo-Masonry using CSS Grid with auto-rows: 1px.
 * Extremely powerful layout that allows elements to span multiple columns 
 * seamlessly without "jumping blocks" caused by CSS standard columns.
 */

export function MasonryContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("grid auto-rows-[1px] items-start", className)}>
      {children}
    </div>
  );
}

export function MasonryItem({ 
  children, 
  isWide = false, 
  gap = 16, 
  className, 
  style, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { isWide?: boolean, gap?: number }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [rowSpan, setRowSpan] = useState(250); // Placeholder span corresponding to ~250px

  useEffect(() => {
    if (!itemRef.current) return;
    const content = itemRef.current.firstElementChild as HTMLElement;
    if (!content) return;

    let rafId: number;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        if (height > 0) {
          // Calculate span based on exact pixel height + gap matching the grid's vertical gap
          // Because grid-auto-rows is 1px, 1 span = 1px.
          // We include the gap in the span so the next item starts after the gap.
          const calculatedSpan = Math.ceil(height + gap);
          
          // Debounce slightly with rAF to prevent loop errors
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
             setRowSpan(calculatedSpan);
          });
        }
      }
    });

    observer.observe(content);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [gap]);

  return (
    <div
      ref={itemRef}
      className={cn("w-full h-full", isWide ? "md:col-span-2" : "col-span-1", className)}
      style={{ gridRowEnd: `span ${rowSpan}`, ...style }}
      {...props}
    >
      <div className="h-max w-full">
        {children}
      </div>
    </div>
  );
}
