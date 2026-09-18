"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-200",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "hover:bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        size === "sm" ? "w-7 h-7" : "w-8 h-8",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute transition-all duration-300",
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute transition-all duration-300",
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  );
}
