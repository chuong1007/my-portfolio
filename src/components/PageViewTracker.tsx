"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    // Skip if same path already tracked (prevents double-track)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // Small delay to ensure page title is updated
    const timer = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_path: pathname,
          page_title: document.title,
          referrer: document.referrer || "",
        }),
      }).catch((err) => {
        // Silently fail — tracking should never break the UX
        console.warn("PageView tracking failed:", err);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
