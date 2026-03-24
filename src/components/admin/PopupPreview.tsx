"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopupPreviewProps {
  content: string;
  bgColor?: string;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export function PopupPreview({ 
  content, 
  bgColor = "#18181b", 
  ctaEnabled, 
  ctaText, 
  ctaLink 
}: PopupPreviewProps) {
  return (
    <div className="w-full h-full min-h-[500px] bg-zinc-950/50 rounded-2xl border border-zinc-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
      </div>

      <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-8">
        Realtime Preview
      </div>

      <div 
        className="w-full max-w-md relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-90"
        style={{ backgroundColor: bgColor }}
      >
        {/* Mock Close Button */}
        <div className="absolute top-3 right-3 p-1.5 bg-black/30 rounded-full text-white/70 border border-white/10">
          <X className="w-3.5 h-3.5" />
        </div>

        <div className="p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
          <div 
            className="prose prose-invert prose-sm max-w-none text-zinc-200 [&_img]:rounded-lg [&_img]:mx-auto"
            dangerouslySetInnerHTML={{ __html: content || "<p class='text-zinc-600 italic'>Chưa có nội dung...</p>" }}
          />
          
          {ctaEnabled && (
            <div className="mt-6 flex justify-center w-full">
              <div 
                className="inline-flex items-center justify-center px-6 py-2.5 bg-zinc-100 text-zinc-900 font-bold text-xs rounded-full shadow-lg cursor-default"
              >
                {ctaText || "Nhấn vào đây"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-zinc-500 italic max-w-[200px]">
          * Đây là bản xem trước cách bộ khung Popup hiển thị trên website.
        </p>
      </div>
    </div>
  );
}
