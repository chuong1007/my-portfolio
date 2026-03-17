"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  bucket?: string;
  path?: string;
  label?: string;
  aspectRatio?: "video" | "square" | "auto";
  className?: string;
};

export function ImageUpload({
  value,
  onChange,
  onUploadStart,
  onUploadEnd,
  bucket = "project-images",
  path = "uploads",
  label = "Click hoặc kéo thả ảnh vào đây",
  aspectRatio = "video",
  className
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    onUploadStart?.();
    
    try {
      // Lazy load supabase to avoid issues
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Lỗi khi tải ảnh lên: ${err instanceof Error ? err.message : "Vui lòng kiểm tra lại cấu hình bucket."}`);
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-zinc-400 mb-1">{label}</label>}
      
      {value ? (
        <div 
          className={cn(
            "relative group rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden",
            aspectRatio === "video" ? "aspect-video" : aspectRatio === "square" ? "aspect-square" : "h-auto"
          )}
        >
          <img
            src={value}
            alt="Uploaded content"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
              title="Thay đổi ảnh"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={() => onChange("")}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-full text-red-500 transition-colors"
              title="Xóa ảnh"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
            aspectRatio === "video" ? "aspect-video" : "aspect-square",
            isDragging 
              ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" 
              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          <div className="text-center px-4">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
            ) : (
              <ImageIcon className={cn("w-10 h-10 mx-auto mb-4 transition-colors", isDragging ? "text-emerald-500" : "text-zinc-600")} />
            )}
            <p className="text-sm font-medium text-zinc-300">
              {uploading ? "Đang tải ảnh lên..." : isDragging ? "Thả ảnh vào đây" : "Click hoặc kéo thả ảnh"}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Chấp nhận PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
