"use client";

import { useState } from "react";
import { X, ArrowRight, Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopupPreviewProps {
  content: string;
  bgColor?: string;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<DeviceMode, { label: string; icon: React.ElementType; screenW: number; screenH: number; popupMaxW: number; scale: number }> = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    screenW: 1200,
    screenH: 680,
    popupMaxW: 640,
    scale: 1,
  },
  tablet: {
    label: "Tablet",
    icon: Tablet,
    screenW: 768,
    screenH: 600,
    popupMaxW: 620,
    scale: 1,
  },
  mobile: {
    label: "Mobile",
    icon: Smartphone,
    screenW: 390,
    screenH: 700,
    popupMaxW: 360,
    scale: 1,
  },
};

export function PopupPreview({
  content,
  bgColor = "#18181b",
  ctaEnabled,
  ctaText,
  ctaLink,
}: PopupPreviewProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const cfg = DEVICE_CONFIG[device];

  return (
    <div className="w-full bg-zinc-950/60 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-zinc-800/80 rounded-lg p-1">
          {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((d) => {
            const Icon = DEVICE_CONFIG[d].icon;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                title={DEVICE_CONFIG[d].label}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  device === d
                    ? "bg-zinc-700 text-zinc-100 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{DEVICE_CONFIG[d].label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold hidden sm:block">
          Preview
        </div>
      </div>

      {/* Preview viewport */}
      <div className="w-full overflow-hidden flex items-start justify-center bg-zinc-950/30 p-4">
        {/* Scaled screen container — keeps aspect ratio */}
        <div
          className="relative overflow-hidden flex-shrink-0 transition-all duration-300"
          style={{
            /* The "screen" width changes per device; we always fit it to the available width via CSS scale */
            width: "100%",
            maxWidth: cfg.screenW,
          }}
        >
          {/* Inner scroll area simulating the real page layer */}
          <div
            className="w-full flex items-center justify-center relative bg-zinc-900/40 rounded-xl border border-zinc-800"
            style={{ minHeight: 180 + (device === "mobile" ? 300 : device === "tablet" ? 260 : 220) }}
          >
            {/* Background page blur effect */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-br from-zinc-900/60 to-zinc-950/80"
              aria-hidden
            />

            {/* The actual popup modal */}
            <div
              className="relative z-10 m-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-full"
              style={{
                backgroundColor: bgColor,
                maxWidth: device === "mobile" ? 320 : device === "tablet" ? 560 : 640,
              }}
            >
              {/* Mock Close Button */}
              <div className="absolute top-3 right-3 p-1.5 bg-black/30 rounded-full text-white/60 border border-white/10 z-10">
                <X className="w-3.5 h-3.5" />
              </div>

              {/* Content */}
              <div
                className={cn(
                  "overflow-y-auto custom-scrollbar flex flex-col justify-center",
                  device === "mobile" ? "p-4" : "p-6"
                )}
                style={{ maxHeight: device === "mobile" ? 400 : 500 }}
              >
                <div
                  className={cn(
                    "prose prose-invert max-w-none text-zinc-200 [&_img]:rounded-xl [&_img]:mx-auto break-words",
                    device === "mobile" ? "prose-xs" : "prose-sm"
                  )}
                  dangerouslySetInnerHTML={{
                    __html:
                      content ||
                      "<p style='color:#52525b;font-style:italic;text-align:center;margin:2rem 0'>Chưa có nội dung...</p>",
                  }}
                />

                {ctaEnabled && (
                  <div className={cn("flex justify-center w-full", device === "mobile" ? "mt-4" : "mt-8")}>
                    <span className="inline-flex items-center gap-2 justify-center px-8 py-3.5 bg-blue-600 text-white font-normal text-sm rounded-full shadow-lg cursor-default whitespace-nowrap">
                      {ctaText || "Nhấn vào đây"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device label badge */}
          <div className="flex justify-center mt-2">
            <span className="text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-mono">
              {device === "desktop" ? "1200px" : device === "tablet" ? "768px" : "390px"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 pt-1 text-center">
        <p className="text-[10px] text-zinc-600 italic">
          * Bản xem trước realtime — mô phỏng giao diện thực tế trên {cfg.label.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
