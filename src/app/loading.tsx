"use client";
import { useEffect, useState } from "react";

export default function Loading({ isCompleting = false }: { isCompleting?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isCompleting) {
      setProgress(100);
      return;
    }

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99; // Hangs at 99% until real load finishes
        
        // Fast at start, slower at the end
        if (prev < 40) return prev + Math.floor(Math.random() * 12) + 5; 
        if (prev < 70) return prev + Math.floor(Math.random() * 8) + 3; 
        if (prev < 90) return prev + Math.floor(Math.random() * 4) + 1; 
        return prev + 1; 
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isCompleting]);

  return (
    <div className={`fixed inset-0 z-[100] w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] transition-opacity duration-300 ${isCompleting ? 'opacity-0 pointer-events-none delay-100' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
        {/* Apple-style progress bar */}
        <div className="h-[2px] w-full bg-[var(--border-default)] rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[var(--text-secondary)] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Percentage Counter */}
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-medium tracking-widest tabular-nums transition-opacity duration-200">
          {progress}%
        </div>
      </div>
    </div>
  );
}