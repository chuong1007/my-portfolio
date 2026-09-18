"use client";

import { useState } from "react";
import { Upload, Smile, Trash2, User } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { cn } from "@/lib/utils";

const EMOJI_PRESETS = [
  "🤩", "😎", "🎨", "👨‍💻", "🚀", "💻", "⚡", "💡", 
  "🔥", "✨", "🎯", "🌟", "😄", "✌️", "👾", "🤖", "👑", "🔮"
];

export function makeEmojiAvatarSvg(emoji: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface AvatarSelectorProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function AvatarSelector({ value, onChange, className }: AvatarSelectorProps) {
  const isEmojiUrl = value?.startsWith("data:image/svg") || value?.includes("avatar-emoji.svg");
  const [tab, setTab] = useState<"upload" | "emoji">(isEmojiUrl ? "emoji" : "upload");
  const [customEmoji, setCustomEmoji] = useState("");

  const handleSelectEmoji = (emoji: string) => {
    const svgUrl = makeEmojiAvatarSvg(emoji);
    onChange(svgUrl);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Option Tabs */}
      <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
            tab === "upload"
              ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          1. Tải lên Avatar
        </button>
        <button
          type="button"
          onClick={() => setTab("emoji")}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
            tab === "emoji"
              ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Smile className="w-3.5 h-3.5 text-amber-400" />
          2. Chọn từ Emoji
        </button>
      </div>

      {/* Content Area */}
      <div className="flex items-start gap-6 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
        {/* Preview Circle */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          {value ? (
            <div className="relative group">
              <img
                src={value}
                alt="Avatar Preview"
                className={cn(
                  "w-24 h-24 object-contain transition-all",
                  isEmojiUrl 
                    ? "rounded-none border-0 shadow-none bg-transparent" 
                    : "rounded-full object-cover border-2 border-zinc-700 shadow-xl bg-zinc-900"
                )}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Xóa avatar"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/40 text-zinc-600">
              <User className="w-8 h-8" />
            </div>
          )}
          <span className="text-[10px] text-zinc-500 font-mono">Xem trước</span>
        </div>

        {/* Controls according to Tab */}
        <div className="flex-1 space-y-3">
          {tab === "upload" ? (
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium block">Chọn tệp ảnh hoặc dán link URL:</label>
              <ImageUpload
                value={value?.startsWith("data:") ? "" : value}
                onChange={(url) => onChange(url)}
                bucket="project-images"
                path="avatars"
                label=""
                aspectRatio="square"
                className="max-w-[200px] [&_label]:min-h-[100px]"
              />
              <p className="text-[11px] text-zinc-500 italic">Hỗ trợ PNG, JPG, WEBP. Ảnh tự động cắt tròn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-medium block">Bấm chọn Emoji hiển thị:</label>
              <div className="grid grid-cols-6 gap-2 max-w-xs">
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className={cn(
                      "w-9 h-9 text-xl rounded-xl flex items-center justify-center border transition-all hover:scale-110",
                      value === makeEmojiAvatarSvg(emoji)
                        ? "bg-amber-500/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "bg-zinc-800/80 border-zinc-700/60 hover:bg-zinc-700"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Custom Emoji Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Hoặc gõ emoji bất kỳ..."
                  value={customEmoji}
                  onChange={(e) => {
                    setCustomEmoji(e.target.value);
                    if (e.target.value.trim()) {
                      handleSelectEmoji(e.target.value.trim());
                    }
                  }}
                  className="w-44 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
