"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Download, Check, Pen, CalendarDays, ExternalLink, ImageIcon, Grid, Tag as TagIcon, LayoutTemplate, Save, Search, Lock, Unlock, GripVertical, AlertCircle, Trash2, X, Trash, PlaySquare, Settings, Eye, EyeOff, LayoutPanelLeft, Link, Loader2, UploadCloud, Copy, FileIcon, User, Video, FileText, CheckCircle2, ChevronDown, Sparkles, FolderOpen, PanelTop, PanelBottom, ChevronRight, ArrowLeft, Upload, Plus, ImageIcon as ImageIconIcon, Link2, Save as SaveIcon, Star } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { MasonryContainer, MasonryItem } from "@/components/MasonryLayout";
import { createClient } from "@/lib/supabase";
import { cn, generateSlug } from "@/lib/utils";
import { compressImage } from "@/lib/compressImage";
import type { DbProject, DbProjectImage } from "@/lib/types";
import { revalidateCache } from "@/app/actions";
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
  const [galleryColumns, setGalleryColumns] = useState<number>(project?.gallery_columns || 4);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState("");

  // RAM Optimization: Manage preview URLs to prevent memory leaks
  const previewUrlsRef = useRef<Map<File, string>>(new Map());

  const getPreviewUrl = useCallback((file: File) => {
    if (!previewUrlsRef.current.has(file)) {
      previewUrlsRef.current.set(file, URL.createObjectURL(file));
    }
    return previewUrlsRef.current.get(file)!;
  }, []);

  useEffect(() => {
    // Revoke URLs for files that are no longer in newImageFiles
    const currentFiles = new Set(newImageFiles);
    previewUrlsRef.current.forEach((url, file) => {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(file);
      }
    });
  }, [newImageFiles]);

  useEffect(() => {
    return () => {
      // Final cleanup on unmount
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [lockedImageIds, setLockedImageIds] = useState<string[]>([]);
  const [wideImages, setWideImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      if (naturalWidth / naturalHeight > 1.4) {
        setWideImages(prev => new Set(prev).add(url));
      }
    }
  };

  // Unified image list for ordering: { type, id/index, url }
  type GalleryItem = { type: 'existing'; data: DbProjectImage } | { type: 'new'; data: File; index: number };

  const getGalleryItems = useCallback((): GalleryItem[] => {
    const items: GalleryItem[] = existingImages.map(img => ({ type: 'existing' as const, data: img }));
    newImageFiles.forEach((file, i) => items.push({ type: 'new' as const, data: file, index: i }));
    return items;
  }, [existingImages, newImageFiles]);

  // Cảnh báo nếu người dùng vô tình đóng tab khi đang lưu ảnh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saving) {
        // Trình duyệt sẽ tự động hiện thông báo mặc định khi thấy e.returnValue có độ dài > 0
        e.preventDefault();
        e.returnValue = 'Dữ liệu đang được tải lên. Bạn có chắc muốn rời đi không? Hệ thống sẽ bị huỷ lưu trữ!';
        return e.returnValue;
      }
      if (newImageFiles.length > 0) {
        e.preventDefault();
        e.returnValue = 'Bạn có ảnh chờ lưu nhưng chưa bấm Cập Nhật. Bạn có chắc muốn thoắt ra không?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saving, newImageFiles.length]);

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

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    // Avoid interfering with basic click elements if this was a button inside
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setSelectedIndices(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else if (e.shiftKey && selectedIndices.length > 0) {
      e.preventDefault();
      const lastSelected = selectedIndices[selectedIndices.length - 1];
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedIndices(Array.from(new Set([...selectedIndices, ...range])));
    } else {
      if (selectedIndices.length === 1 && selectedIndices[0] === index) {
        setSelectedIndices([]);
      } else {
        setSelectedIndices([index]);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const item = getGalleryItems()[index];
    const id = item.type === 'existing' ? (item.data as DbProjectImage).id : `new-${(item as any).index}`;
    if (lockedImageIds.includes(id)) {
      e.preventDefault(); // Chặn hành vi drag ngay lập tức đối với item bị khoá
      return;
    }

    setDragIndex(index);
    if (!selectedIndices.includes(index)) {
      setSelectedIndices([index]);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    if (selectedIndices.includes(index)) {
      setDragOverIndex(null);
      return; 
    }
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (selectedIndices.includes(dropIndex)) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = getGalleryItems();
    const indicesToMove = selectedIndices.length > 0 ? [...selectedIndices] : [dragIndex];
    if (!indicesToMove.includes(dragIndex)) indicesToMove.push(dragIndex);
    indicesToMove.sort((a,b) => a - b);

    // Kiểm tra khoá
    const movingLocked = indicesToMove.some(idx => {
      const item = items[idx];
      const id = item.type === 'existing' ? (item.data as DbProjectImage).id : `new-${item.index}`;
      return lockedImageIds.includes(id);
    });
    if (movingLocked) {
      alert("Bạn không thể kéo một bức ảnh đang bị khoá vị trí!");
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const lockedSlots = new Set<number>();
    items.forEach((item, index) => {
      const id = item.type === 'existing' ? (item.data as DbProjectImage).id : `new-${(item as any).index}`;
      if (lockedImageIds.includes(id)) {
        lockedSlots.add(index);
      }
    });

    const targetSlots = indicesToMove.map((_, i) => dropIndex + i);
    const dropOnLocked = targetSlots.some(slot => lockedSlots.has(slot));
    if (dropOnLocked) {
      alert("Bạn đang chèn lên vị trí bị khoá. Hệ thống đã huỷ thao tác để tránh lỗi lộn xộn.");
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // LOGIC SWAP (HOÁN ĐỔI) ĐỂ KHÔNG BAO GIỜ NHẢY ẢNH:
    // Copy toàn bộ mảng thay vì splice để tránh hiệu ứng domino
    const finalItems = [...items];
    const sourceItems = indicesToMove.map(idx => items[idx]);
    const targetItems = targetSlots.map(idx => items[idx]);

    // Swap
    indicesToMove.forEach((sourceIdx, idx) => {
      const targetIdx = targetSlots[idx];
      if (targetIdx < finalItems.length) {
        finalItems[targetIdx] = sourceItems[idx];
        finalItems[sourceIdx] = targetItems[idx];
      }
    });

    // Rebuild existing and new arrays from reordered items
    const newExisting: DbProjectImage[] = [];
    const newFiles: File[] = [];
    finalItems.forEach((item, i) => {
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
    setSelectedIndices([]);
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
            gallery_columns: galleryColumns,
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
            gallery_columns: galleryColumns,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        projectId = newProject?.id;
      }

      // Upload new gallery images
      if (projectId && newImageFiles.length > 0) {
        setSaveSuccess(`Đang chuẩn bị tải lên ${newImageFiles.length} ảnh...`);
        const startOrder = existingImages.length;
        const imageInserts: any[] = [];
        
        // Step 1: Chunking files into groups of 5
        const chunkSize = 5;
        const totalFiles = newImageFiles.length;
        
        for (let i = 0; i < totalFiles; i += chunkSize) {
          const chunk = newImageFiles.slice(i, i + chunkSize);
          const chunkIndex = Math.floor(i / chunkSize) + 1;
          const totalChunks = Math.ceil(totalFiles / chunkSize);
          
          setSaveSuccess(`Đang tải đợt ${chunkIndex}/${totalChunks}...`);

          // Process each chunk in parallel using Promise.all
          const chunkResults = await Promise.all(chunk.map(async (file, indexInChunk) => {
            const globalIndex = i + indexInChunk;
            let attempt = 0;
            const maxAttempts = 3; // Step 2: Retry up to 3 times
            let lastError = null;

            while (attempt < maxAttempts) {
              try {
                // Compress image
                const compressed = await compressImage(file, {
                  maxWidth: 1920,
                  maxHeight: 1920,
                  quality: 0.82,
                  maxSizeMB: 1,
                });

                const safeName = compressed.name
                  .replace(/[^a-zA-Z0-9.-]/g, '-')
                  .replace(/-+/g, '-');
                
                const fileName = `gallery/${projectId}/${Date.now()}-${globalIndex}-${safeName}`;

                const { error: uploadError } = await supabase.storage
                  .from("project-images")
                  .upload(fileName, compressed, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: compressed.type,
                  });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                  .from("project-images")
                  .getPublicUrl(fileName);

                return {
                  project_id: projectId!,
                  image_url: data.publicUrl,
                  display_order: startOrder + globalIndex,
                };
              } catch (err) {
                attempt++;
                lastError = err;
                console.warn(`[Image ${globalIndex + 1}] Lỗi tải (Lần ${attempt}):`, err);
                if (attempt < maxAttempts) {
                  // Wait before retry (exponential backoff)
                  await new Promise(r => setTimeout(r, 1000 * attempt));
                }
              }
            }
            // Step 2: Mandatory failure report
            console.error(`[Image ${globalIndex + 1}] Thất bại hoàn toàn sau 3 lần thử:`, lastError);
            return null;
          }));

          // Add successful uploads from this chunk
          imageInserts.push(...chunkResults.filter(r => r !== null));
        }

        // Step 3: Count Verification Guard
        if (imageInserts.length !== newImageFiles.length) {
          alert(`⚠️ CẢNH BÁO RỚT FILE: Chỉ có ${imageInserts.length}/${newImageFiles.length} ảnh được tải lên thành công. Vui lòng kiểm tra lại kết nối.`);
        }

        // Final Insert to DB
        if (imageInserts.length > 0) {
          const { data: insertedData, error: insError } = await supabase
            .from("project_images")
            .insert(imageInserts)
            .select();
            
          if (insError) throw insError;
          
          if (isEditing && insertedData) {
            setNewImageFiles([]);
            setExistingImages(prev => [...prev, ...insertedData]);
          }
        }
      }

      // Force revalidate both home and projects pages
      await revalidateCache('/');
      await revalidateCache('/projects');

      setSaveSuccess("Đã cập nhật dự án thành công!");
      setTimeout(() => setSaveSuccess(""), 3000);

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
            <span className="whitespace-nowrap">
              {saving ? (saveSuccess || "Đang lưu...") : saveSuccess || (isEditing ? "Cập nhật" : "Tạo dự án")}
            </span>
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
            <div className="flex items-center justify-between mb-4">
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

            {/* Gallery Column Selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-blue-400" />
                  Số cột hiển thị (Desktop)
                </span>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {galleryColumns} Cột
                </span>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-800">
                {[2, 3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setGalleryColumns(cols)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                      galleryColumns === cols 
                        ? "bg-zinc-800 text-white shadow-lg border border-white/5" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {cols}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 italic">Bro chọn số cột phù hợp với tính chất của từng project nhé!</p>
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

          {/* Image Grid - 4-column vertical flow per request */}
          <MasonryContainer className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4">
            {getGalleryItems().map((item, index) => {
              const isExisting = item.type === 'existing';
              const imgUrl = isExisting ? (item.data as DbProjectImage).image_url : getPreviewUrl(item.data as File);
              const imgId = isExisting ? (item.data as DbProjectImage).id : `new-${item.index}`;
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;
              const isSelected = selectedIndices.includes(index);
              const isLocked = lockedImageIds.includes(imgId);
              const isWide = wideImages.has(imgUrl);

              return (
                <MasonryItem
                  key={imgId}
                  isWide={false}
                  gap={16}
                  draggable={!isLocked}
                  onClick={(e) => handleImageClick(e, index)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative group rounded-lg transition-all duration-200 ring-offset-zinc-950",
                    isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                    isSelected ? "ring-4 ring-emerald-500 ring-offset-2 scale-[0.98]" : "ring-1 ring-white/5",
                    isDragging && "opacity-50 scale-95",
                    isDragOver && !isSelected && "ring-2 ring-indigo-500 ring-offset-2 scale-[1.02]",
                    isLocked && "ring-2 ring-amber-500/50" // Viền nhẹ để báo hiệu đang khoá
                  )}
                >
                  <img
                    src={imgUrl}
                    onLoad={(e) => handleImageLoad(imgUrl, e)}
                    alt=""
                    referrerPolicy="no-referrer"
                    className={cn(
                      "w-full h-auto object-cover rounded-lg bg-zinc-900 min-h-[50px] pointer-events-none transition-all duration-300",
                      isLocked && "opacity-90 grayscale-[0.2]"
                    )}
                  />
                  {/* Lock button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLockedImageIds(prev => 
                        prev.includes(imgId) ? prev.filter(id => id !== imgId) : [...prev, imgId]
                      );
                      // Nếu đang bị chọn mà bấm khoá thì tự động bỏ chọn luôn
                      if (!isLocked && isSelected) {
                        setSelectedIndices(prev => prev.filter(i => i !== index));
                      }
                    }}
                    className={cn(
                      "absolute top-1 left-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all z-20 backdrop-blur-sm shadow-md",
                      isLocked 
                        ? "bg-amber-500 text-white opacity-100 ring-1 ring-amber-400" 
                        : "bg-black/60 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/80"
                    )}
                    title={isLocked ? "Mở khoá vị trí" : "Khoá cố định vị trí này"}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Drag handle */}
                  {!isLocked && (
                    <div className="absolute top-1 left-9 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <GripVertical className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {/* Multi-selection indicator count */}
                  {isDragging && selectedIndices.length > 1 && isSelected && index === dragIndex && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none z-10 text-sm">
                      {selectedIndices.length} items
                    </div>
                  )}
                  {/* Order number */}
                  <div className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded font-mono pointer-events-none">
                    {index + 1}
                  </div>
                  {/* New badge */}
                  {!isExisting && (
                    <div className="absolute bottom-1 left-1 text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded pointer-events-none">
                      Mới
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExisting) removeExistingImage((item.data as DbProjectImage).id);
                      else removeNewImage((item as any).index);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </MasonryItem>
              );
            })}
          </MasonryContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
