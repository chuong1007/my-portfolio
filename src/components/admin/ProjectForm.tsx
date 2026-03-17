"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X, Plus, Loader2, ImageIcon as ImageIconIcon } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { DbProject, DbProjectImage } from "@/lib/types";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/builder/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });

const AVAILABLE_TAGS = ["Poster", "Branding", "Logo Design", "UX/UI"];

type ProjectFormProps = {
  project?: (DbProject & { images: DbProjectImage[] }) | null;
  onClose: () => void;
};

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const isEditing = !!project;

  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [coverImage, setCoverImage] = useState<string>(project?.cover_image || "");
  const [existingImages, setExistingImages] = useState<DbProjectImage[]>(project?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(project?.is_visible !== false);
  const [isFeatured, setIsFeatured] = useState<boolean>(project?.is_featured || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Removed manual handleCoverUpload as it's handled by ImageUpload component
  
  const [galleryDragging, setGalleryDragging] = useState(false);

  const handleGalleryUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    setNewImageFiles((prev) => [...prev, ...fileArray]);
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      let projectId = project?.id;

      if (isEditing && projectId) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            title,
            description,
            tags,
            cover_image: coverImage,
            is_visible: isVisible,
            is_featured: isFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
        
        if (error) throw error;

        // Delete removed images from DB
        const existingIds = existingImages.map((img) => img.id);
        const originalIds = project?.images?.map((img) => img.id) || [];
        const deletedIds = originalIds.filter((id) => !existingIds.includes(id));

        if (deletedIds.length > 0) {
          const { error: delError } = await supabase.from("project_images").delete().in("id", deletedIds);
          if (delError) throw delError;
        }
      } else {
        // Insert new project
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert({
            title,
            description,
            tags,
            cover_image: coverImage,
            is_visible: isVisible,
            is_featured: isFeatured,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        projectId = newProject?.id;
      }

      // Upload new gallery images
      if (projectId && newImageFiles.length > 0) {
        const startOrder = existingImages.length;

        const imageInserts = await Promise.all(
          newImageFiles.map(async (file, i) => {
            const fileName = `gallery/${projectId}/${Date.now()}-${i}-${file.name}`;
            const { error } = await supabase.storage
              .from("project-images")
              .upload(fileName, file);

            if (!error) {
              const { data } = supabase.storage
                .from("project-images")
                .getPublicUrl(fileName);

              return {
                project_id: projectId!,
                image_url: data.publicUrl,
                display_order: startOrder + i,
              };
            }
            console.error("Gallery upload error:", error);
            return null;
          })
        );

        const validInserts = imageInserts.filter((item): item is any => item !== null);
        if (validInserts.length > 0) {
          const { error: insError } = await supabase.from("project_images").insert(validInserts);
          if (insError) throw insError;
        }
      }

      onClose();
    } catch (err) {
      console.error("Critical error saving project:", err);
      alert(`Lỗi khi lưu dự án: ${err instanceof Error ? err.message : JSON.stringify(err, null, 2)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tên dự án *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên dự án..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Mô tả dự án
            </label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Viết mô tả dự án tuyệt vời của bạn ở đây..."
              className="bg-zinc-900 border-zinc-800"
              editable={true}
            />
          </div>

          {/* Visibility & Featured Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                id="project-visible-toggle"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-zinc-50 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="project-visible-toggle" className="text-zinc-200 cursor-pointer select-none">
                Hiển thị dự án (Bật mắt)
              </label>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                id="project-featured-toggle"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-zinc-50 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="project-featured-toggle" className="text-zinc-200 cursor-pointer select-none">
                Dự án Nổi bật (Hàng đầu)
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isActive = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isActive
                        ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                        : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Image */}
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            label="Ảnh bìa dự án *"
            path="projects/covers"
            onUploadStart={() => setUploading(true)}
            onUploadEnd={() => setUploading(false)}
          />
        </div>

        {/* Right Column - Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Hình ảnh dự án ({existingImages.length + newImageFiles.length} ảnh)
          </label>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setGalleryDragging(true); }}
            onDragLeave={() => setGalleryDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setGalleryDragging(false);
              if (e.dataTransfer.files) handleGalleryUpload(e.dataTransfer.files);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleGalleryUpload(files);
              };
              input.click();
            }}
            className={cn(
               "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 mb-4",
               galleryDragging 
                ? "border-emerald-500 bg-emerald-500/5 scale-[0.98]" 
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900"
            )}
          >
            <div className="text-center">
              <Upload className={cn("w-8 h-8 mx-auto mb-2 transition-colors", galleryDragging ? "text-emerald-500" : "text-zinc-600")} />
              <p className="text-xs font-medium text-zinc-300">
                {galleryDragging ? "Thả để thêm ảnh" : "Thêm ảnh dự án"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Kéo thả hoặc click để chọn nhiều ảnh</p>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative aspect-square group">
                <img
                  src={img.image_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg bg-zinc-900 min-h-[50px]"
                />
                <button
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}

            {/* New Image Previews */}
            {newImageFiles.map((file, i) => (
              <div key={i} className="relative aspect-square group">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-zinc-700"
                />
                <button
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-1 left-1 text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded">
                  Mới
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-end gap-4">
        <button
          onClick={onClose}
          className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-8 py-3 bg-zinc-50 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo dự án"}
        </button>
      </div>
    </div>
  );
}
