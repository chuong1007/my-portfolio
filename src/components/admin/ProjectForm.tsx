"use client";

import { useState, useCallback, useRef } from "react";
import { ArrowLeft, Upload, X, Plus, Loader2, ImageIcon as ImageIconIcon, Link2, Check, Copy, Eye, EyeOff, Save as SaveIcon, ExternalLink, Star, GripVertical, Tag as TagIcon } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { createClient } from "@/lib/supabase";
import { cn, generateSlug } from "@/lib/utils";
import { compressImage } from "@/lib/compressImage";
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
  const isMockProject = (project as any)?.isMock === true;

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!project?.slug);
  const [description, setDescription] = useState(project?.description || "");
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [coverImage, setCoverImage] = useState<string>(project?.cover_image || "");
  const [existingImages, setExistingImages] = useState<DbProjectImage[]>(project?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(project?.is_visible !== false);
  const [isFeatured, setIsFeatured] = useState<boolean>(project?.is_featured || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleCopyUrl = () => {
    if (!slug) return;
    const fullUrl = `https://chuong-graphic.vercel.app/project/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    const sanitized = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(sanitized);
    setSlugManuallyEdited(true);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    const tagName = newTagInput.trim();
    if (!tagName) return;
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e.type === 'keydown') (e as React.KeyboardEvent).preventDefault();
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
    setNewTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Removed manual handleCoverUpload as it's handled by ImageUpload component
  
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Unified image list for ordering: { type, id/index, url }
  type GalleryItem = { type: 'existing'; data: DbProjectImage } | { type: 'new'; data: File; index: number };

  const getGalleryItems = useCallback((): GalleryItem[] => {
    const items: GalleryItem[] = existingImages.map(img => ({ type: 'existing' as const, data: img }));
    newImageFiles.forEach((file, i) => items.push({ type: 'new' as const, data: file, index: i }));
    return items;
  }, [existingImages, newImageFiles]);

  const handleGalleryUpload = (files: FileList) => {
    // Chỉ lấy file ảnh
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    setNewImageFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles: File[] = [];
      
      for (const f of fileArray) {
        let finalFile = f;
        let fileName = f.name;
        let counter = 1;
        
        // Nếu trùng tên trong danh sách chờ, tự động thêm số -1, -2... để không bị loại bỏ
        while (existingNames.has(fileName)) {
          const nameParts = f.name.split('.');
          const ext = nameParts.length > 1 ? nameParts.pop() : '';
          const baseName = nameParts.join('.');
          fileName = ext ? `${baseName}-${counter}.${ext}` : `${f.name}-${counter}`;
          counter++;
        }
        
        if (fileName !== f.name) {
          // Tạo File mới với tên đã xử lý
          finalFile = new File([f], fileName, { type: f.type });
        }
        
        existingNames.add(fileName);
        newFiles.push(finalFile);
      }
      return [...prev, ...newFiles];
    });
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (idx: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = getGalleryItems();
    const [movedItem] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, movedItem);

    // Rebuild existing and new arrays from reordered items
    const newExisting: DbProjectImage[] = [];
    const newFiles: File[] = [];
    items.forEach((item, i) => {
      if (item.type === 'existing') {
        newExisting.push({ ...item.data, display_order: i });
      } else {
        newFiles.push(item.data);
      }
    });

    setExistingImages(newExisting);
    setNewImageFiles(newFiles);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      let projectId = project?.id;

      if (isEditing && projectId && !isMockProject) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            title,
            slug: slug || generateSlug(title),
            description,
            tags,
            cover_image: coverImage,
            is_visible: isVisible,
            is_featured: isFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
        
        if (error) throw error;

        // Delete removed images from DB & Storage
        const existingIds = existingImages.map((img) => img.id);
        const originalImages = project?.images || [];
        const deletedImages = originalImages.filter((img) => !existingIds.includes(img.id));

        if (deletedImages.length > 0) {
          // Remove from Supabase Storage first
          const storagePaths = deletedImages
            .map((img) => {
              try {
                // Extract relative path from full public URL
                // Example URL: https://.../storage/v1/object/public/project-images/gallery/123/...
                const urlParts = img.image_url.split('/public/project-images/');
                return urlParts.length > 1 ? decodeURIComponent(urlParts[1]) : null;
              } catch {
                return null;
              }
            })
            .filter((path): path is string => path !== null);

          if (storagePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from("project-images")
              .remove(storagePaths);
            if (storageError) console.error("Lỗi khi xóa ảnh trên Supabase Storage:", storageError);
          }

          // Remove database records
          const deletedIds = deletedImages.map((img) => img.id);
          const { error: delError } = await supabase.from("project_images").delete().in("id", deletedIds);
          if (delError) throw delError;
        }

        // Update display_order for reordered existing images
        for (const img of existingImages) {
          await supabase.from("project_images").update({ display_order: img.display_order }).eq("id", img.id);
        }
      } else {
        // Insert new project
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert({
            title,
            slug: slug || generateSlug(title),
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
        const imageInserts: any[] = [];
        
        // Process strictly sequentially (1 by 1) to guarantee NO Supabase Rate Limiting (HTTP 429) 
        // and no browser Canvas memory crashes when uploading 50+ images at once.
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          try {
            // Compress before upload
            const compressed = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.82,
              maxSizeMB: 1,
            });
            
            // Safe filename with encodeURIComponent to prevent URL parsing errors
            const safeName = encodeURIComponent(compressed.name.replace(/\s+/g, '-'));
            const fileName = `gallery/${projectId}/${Date.now()}-${i}-${safeName}`;
            
            const { error } = await supabase.storage
              .from("project-images")
              .upload(fileName, compressed, {
                cacheControl: '3600',
                contentType: compressed.type,
              });

            if (!error) {
              const { data } = supabase.storage
                .from("project-images")
                .getPublicUrl(fileName);

              imageInserts.push({
                project_id: projectId!,
                image_url: data.publicUrl,
                display_order: startOrder + i,
              });
            } else {
              console.error(`Supabase upload error on file [${file.name}]:`, error);
            }
          } catch (err) {
            console.error(`Exception during processing of [${file.name}]:`, err);
          }
        }

        const validInserts = imageInserts.filter((item): item is any => item !== null);
        if (validInserts.length > 0) {
          const { data: insertedData, error: insError } = await supabase
            .from("project_images")
            .insert(validInserts)
            .select();
            
          if (insError) throw insError;
          
          if (isEditing && insertedData) {
            // Update UI state so multiple clicks on Save won't re-upload
            setNewImageFiles([]);
            setExistingImages(prev => [...prev, ...insertedData]);
          }
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (!isEditing) {
        onClose();
      }
    } catch (err) {
      console.error("Critical error saving project:", err);
      alert(`Lỗi khi lưu dự án: ${err instanceof Error ? err.message : JSON.stringify(err, null, 2)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Sticky Quick Actions Bar */}
      <div className="sticky top-[48px] md:top-[57px] z-[40] -mx-4 px-4 py-4 mb-8 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between gap-4 rounded-b-2xl shadow-xl shadow-black/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors p-2 hover:bg-zinc-900 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">
              {isEditing ? `Sửa: ${title}` : "Thêm dự án mới"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Visibility Toggle */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
              isVisible 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
            }`}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden xs:inline">{isVisible ? "Công khai" : "Đang ẩn"}</span>
          </button>

          {/* Featured Toggle */}
          <button
            onClick={() => setIsFeatured(!isFeatured)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
              isFeatured 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
            }`}
            title="Đánh dấu Nổi bật"
          >
            <Star className={cn("w-4 h-4", isFeatured && "fill-current")} />
            <span className="hidden xs:inline">Nổi bật</span>
          </button>

          {/* Preview Button */}
          {isEditing && (
            <a
              href={`/project/${slug || project?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden xs:inline">Xem trước</span>
            </a>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="hidden sm:block px-3 py-2 text-zinc-400 hover:text-zinc-200 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            {isEditing ? "Đóng" : "Hủy bỏ"}
          </button>

          {/* Quick Save */}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
            <span>{saving ? "Đang lưu..." : saveSuccess ? "Đã lưu" : isEditing ? "Cập nhật" : "Tạo dự án"}</span>
          </button>
        </div>
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tên dự án..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <Link2 className="w-4 h-4 inline mr-1.5" />
              Đường dẫn (Slug)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-600 transition-all overflow-hidden line-clamp-1">
                <span className="text-sm text-zinc-500 shrink-0 whitespace-nowrap hidden sm:inline-block">https://chuong-graphic.vercel.app/project/</span>
                <span className="text-sm text-zinc-500 shrink-0 whitespace-nowrap sm:hidden">.../project/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  className="flex-1 bg-transparent text-zinc-50 font-mono text-sm placeholder:text-zinc-600 focus:outline-none min-w-0 ml-1"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                disabled={!slug}
                className="shrink-0 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {slug && (
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                URL: <a href={`https://chuong-graphic.vercel.app/project/${slug}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 font-mono hover:text-white transition-colors break-all">https://chuong-graphic.vercel.app/project/{slug}</a>
              </p>
            )}
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



          {/* Tags */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-emerald-500" />
              Quản lý Tags
            </h3>

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Thêm tag mới..."
                className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">Chưa có tag nào...</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold group"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-emerald-500/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Suggested Tags */}
            <div className="pt-4 border-t border-zinc-800/50">
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-3">Gợi ý</p>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-md text-[10px] transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Media */}
        <div className="space-y-8">
          {/* Cover Image */}
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            label="Ảnh bìa dự án *"
            path="projects/covers"
            onUploadStart={() => setUploading(true)}
            onUploadEnd={() => setUploading(false)}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-400">
                Hình ảnh dự án ({existingImages.length + newImageFiles.length} ảnh)
              </label>
              {(existingImages.length + newImageFiles.length) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa TẤT CẢ hình ảnh?")) {
                      setExistingImages([]);
                      setNewImageFiles([]);
                    }
                  }}
                  className="text-[11px] text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

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

          {/* Image Grid - 4 columns with drag & drop */}
          <div className="grid grid-cols-4 gap-2 max-h-[600px] overflow-y-auto">
            {getGalleryItems().map((item, index) => {
              const isExisting = item.type === 'existing';
              const imgUrl = isExisting ? (item.data as DbProjectImage).image_url : URL.createObjectURL(item.data as File);
              const imgId = isExisting ? (item.data as DbProjectImage).id : `new-${(item as any).index}`;
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={imgId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative aspect-square group cursor-grab active:cursor-grabbing rounded-lg transition-all duration-200",
                    isDragging && "opacity-30 scale-95",
                    isDragOver && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 scale-[1.02]"
                  )}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg bg-zinc-900 min-h-[50px] pointer-events-none"
                  />
                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>
                  {/* Order number */}
                  <div className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                    {index + 1}
                  </div>
                  {/* New badge */}
                  {!isExisting && (
                    <div className="absolute bottom-1 left-1 text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded">
                      Mới
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExisting) removeExistingImage((item.data as DbProjectImage).id);
                      else removeNewImage((item as any).index);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
