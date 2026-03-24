"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function GlobalPopup({ isVisible, rawContent }: { isVisible: boolean, rawContent: any }) {
  const [show, setShow] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlKey, setHtmlKey] = useState("");

  useEffect(() => {
    if (!isVisible || !rawContent) return;

    // Extract HTML using responsive helper or string
    let parsedHTML = "";
    if (typeof rawContent === "string") {
      parsedHTML = rawContent;
    } else if (typeof rawContent === "object" && rawContent !== null) {
      if ("content" in rawContent) {
        if (typeof rawContent.content === "object" && rawContent.content !== null) {
          parsedHTML = rawContent.content.desktop || rawContent.content.mobile || "";
        } else {
          parsedHTML = rawContent.content || "";
        }
      } else if (typeof rawContent.desktop === "string") {
        parsedHTML = rawContent.desktop;
      }
    }

    if (!parsedHTML || parsedHTML.trim() === "" || parsedHTML === "<p></p>") return;
    setHtmlContent(parsedHTML);

    const contentKey = `popup_seen_count_${parsedHTML.length}`;
    setHtmlKey(contentKey);

    const maxDisplayTimes = rawContent.maxDisplayTimes || 1;
    const delayMs = (typeof rawContent.delaySeconds === 'number' ? rawContent.delaySeconds : 1.5) * 1000;
    const seenTimes = parseInt(localStorage.getItem(contentKey) || "0", 10);

    if (seenTimes < maxDisplayTimes) {
      const timer = setTimeout(() => setShow(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [isVisible, rawContent]);

  const handleClose = () => {
    setShow(false);
    if (htmlKey) {
      const seenTimes = parseInt(localStorage.getItem(htmlKey) || "0", 10);
      localStorage.setItem(htmlKey, (seenTimes + 1).toString());
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div key="global-popup-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ backgroundColor: rawContent?.bgColor || 'rgba(24, 24, 27, 0.9)' }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center">
              <div 
                className="prose prose-invert max-w-none text-zinc-200 [&_img]:rounded-xl [&_img]:mx-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              
              {rawContent?.ctaEnabled && (
                <div className="mt-8 flex justify-center w-full">
                  <a 
                    href={rawContent.ctaLink || "#"} 
                    target={rawContent.ctaLink?.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold text-sm sm:text-base rounded-full shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_0_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                  >
                    {rawContent.ctaText || "Nhấn vào đây"}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
