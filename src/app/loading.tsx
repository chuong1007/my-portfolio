"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99; // Hangs at 99% until real load finishes
        
        // Fast at start, slower at the end
        if (prev < 40) return prev + Math.floor(Math.random() * 8) + 4; // +4 to +11
        if (prev < 70) return prev + Math.floor(Math.random() * 5) + 2; // +2 to +6
        if (prev < 90) return prev + Math.floor(Math.random() * 3) + 1; // +1 to +3
        return prev + 1; // very slow at the end
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
        {/* Apple-style progress bar */}
        <div className="h-[2px] w-full bg-[var(--border-default)] rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[var(--text-secondary)] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Percentage Counter */}
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-medium tracking-widest tabular-nums">
          {progress}%
        </div>
      </div>
    </div>
  );
}
