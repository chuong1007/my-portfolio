"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // 1. Chống Bot/Crawler cơ bản
    if (typeof window === "undefined") return;
    
    const ua = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|lighthouse|hyperdx|vercel|headless/i.test(ua);
    if (isBot) return;

    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    // 2. Kiểm tra và duy trì visitor_id (Persistence)
    let visitorId = localStorage.getItem('visitor_id');
    
    if (!visitorId) {
      // Tạo ID mới nếu chưa có
      visitorId = 'v-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      localStorage.setItem('visitor_id', visitorId);
      console.log("Generated and saved new visitor_id:", visitorId);
    } else {
      console.log("Using existing visitor_id from localStorage:", visitorId);
    }

    // Skip if same path already tracked (prevents double-track)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

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
        console.warn("PageView tracking failed:", err);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
