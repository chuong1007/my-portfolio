"use client";
import { useEffect, useState } from "react";

export default function Loading({ isCompleting = false }: { isCompleting?: boolean }) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    if (isCompleting) {
      // Allow the exit transition to play
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isCompleting]);

  if (!show && isCompleting) return null;

  return (
    <div className={`fixed inset-0 z-[100] w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] transition-opacity duration-300 ${isCompleting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px] overflow-hidden">
        {/* Apple-style indeterminate progress bar */}
        <div className="h-[3px] w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 left-0 h-full rounded-full"
            style={{
              width: "50%",
              color: "var(--text-primary)",
              background: "linear-gradient(to right, transparent, currentColor)",
              animation: "indeterminate-slide 2s infinite ease-in-out"
            }}
          />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes indeterminate-slide {
          0% { transform: translateX(-100%); }
          75% { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}
