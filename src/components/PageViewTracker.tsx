"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // 1. Chống Bot/Crawler cơ bản
    const ua = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|lighthouse|hyperdx|vercel|headless/i.test(ua);
    if (isBot) return;

    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    // Skip if same path already tracked (prevents double-track)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // 2. Lưu trữ vĩnh viễn (Persistence) bằng localStorage
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      // Tạo ID mới nếu chưa có (UUID v4 style simple)
      visitorId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('visitor_id', visitorId);
    }

    // Small delay to ensure page title is updated
    const timer = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId,
          page_path: pathname,
          page_title: document.title,
          referrer: document.referrer || "",
        }),
      }).catch((err) => {
        // Silently fail — tracking should never break the UX
        console.warn("PageView tracking failed:", err);
      });
    }, 500); // 500ms delay for better title sync

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
