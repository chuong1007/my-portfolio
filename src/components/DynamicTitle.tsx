"use client";

import { useEffect } from "react";

export function DynamicTitle() {
  useEffect(() => {
    let originalTitle = document.title;
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Cập nhật originalTitle phòng trường hợp title bị đổi bởi router Next.js
        originalTitle = document.title;
        document.title = "Ê khoan, đừng đi vội! 👋";
      } else {
        document.title = originalTitle;
        // Optionally cycle back to full title if you want, but simple restore is best
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
