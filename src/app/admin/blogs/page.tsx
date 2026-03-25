"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Pencil, Trash2, FileText, ExternalLink,
  Image as ImageIcon, ArrowLeft, Eye, EyeOff, Search,
  Newspaper, Star, Save, Check, GripVertical
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { BlogForm } from "@/components/admin/BlogForm";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminBlogsPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [blogs, setBlogs] = useState<DbBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<DbBlog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Reorder state
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [saveOrderSuccess, setSaveOrderSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: blogsData } = await supabase
      .from("blogs")
      .select("*")
      .order("display_order", { ascending: true });

    if (blogsData) {
      // Ensure display_order is set for all blogs
      const ordered = blogsData.map((b, idx) => ({
        ...b,
        display_order: b.display_order || idx + 1,
      }));
      setBlogs(ordered);

      if (editId) {
        const blogToEdit = ordered.find((b) => b.id === editId);
        if (blogToEdit) setEditingBlog(blogToEdit);
      }
    }
    setLoading(false);
    setOrderChanged(false);
  }, [editId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;
    const supabase = createClient();
    await supabase.from("blogs").delete().eq("id", id);
    fetchData();
  };

  const handleToggleVisibility = async (id: string, currentStatus: boolean | undefined) => {
    const supabase = createClient();
    await supabase
      .from("blogs")
      .update({ is_published: !(currentStatus ?? true) })
      .eq("id", id);
    fetchData();
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const supabase = createClient();
    await supabase
      .from("blogs")
      .update({ is_featured: !currentFeatured })
      .eq("id", id);
    fetchData();
  };

  const handleFormClose = () => {
    setShowBlogForm(false);
    setEditingBlog(null);
    fetchData();
  };

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeBlogId = active.id as string;
      const overBlogId = over.id as string;

      const featured = blogs.filter((b) => b.is_featured);
      const normal = blogs.filter((b) => !b.is_featured);

      const oldIndex = normal.findIndex((b) => b.id === activeBlogId);
      const newIndex = normal.findIndex((b) => b.id === overBlogId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newNormal = arrayMove(normal, oldIndex, newIndex);
        
        const reordered = [
          ...featured.map((b, i) => ({ ...b, display_order: i + 1 })),
          ...newNormal.map((b, i) => ({ ...b, display_order: featured.length + i + 1 })),
        ];
        
        setBlogs(reordered);
        setOrderChanged(true);
      }
    }
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const supabase = createClient();
      await Promise.all(
        blogs.map((b) =>
          supabase
            .from("blogs")
            .update({ display_order: b.display_order })
            .eq("id", b.id)
        )
      );
      setSaveOrderSuccess(true);
      setOrderChanged(false);
      setTimeout(() => setSaveOrderSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving order:", err);
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (blog.slug && blog.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredBlogs = filteredBlogs.filter((b) => b.is_featured);
  const normalBlogs = filteredBlogs.filter((b) => !b.is_featured);

  if (showBlogForm || editingBlog) {
    return <BlogForm blog={editingBlog} onClose={handleFormClose} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50 shadow-2xl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-emerald-500" />
              Quản Lý Blog
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase font-bold tracking-widest">
              {blogs.length} BÀI VIẾT HIỆN CÓ TRÊN HỆ THỐNG
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {orderChanged && (
            <button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="flex items-center gap-2 px-5 py-3.5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 whitespace-nowrap disabled:opacity-60"
            >
              {savingOrder ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saveOrderSuccess ? (
                <Check className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {savingOrder ? "Đang lưu..." : saveOrderSuccess ? "Đã lưu!" : "Lưu thứ tự"}
            </button>
          )}
          <button
            onClick={() => setShowBlogForm(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-black font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-white/5 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Tạo Bài Viết Mới
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-zinc-900/20 p-2 rounded-2xl border border-zinc-800/30">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề hoặc đường dẫn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border-none pl-12 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500/50 transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg font-medium">Chưa có bài viết nào</p>
          <p className="text-zinc-600 text-sm mt-1">Nhấn &quot;Tạo Bài Viết Mới&quot; để bắt đầu</p>
        </div>
      )}

      {/* FEATURED BLOGS (Pinned) */}
      {!loading && featuredBlogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest">
              Bài viết nổi bật ({featuredBlogs.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredBlogs.map((blog) => (
              <BlogCardHorizontal
                key={blog.id}
                blog={blog}
                isFeatured
                onEdit={() => setEditingBlog(blog)}
                onDelete={() => handleDeleteBlog(blog.id)}
                onToggleVisibility={() => handleToggleVisibility(blog.id, blog.is_published)}
                onToggleFeatured={() => handleToggleFeatured(blog.id, blog.is_featured)}
              />
            ))}
          </div>
        </div>
      )}

      {/* NORMAL BLOGS (Reorderable) */}
      {!loading && normalBlogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Newspaper className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest">
              Tất cả bài viết ({normalBlogs.length})
            </h2>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SortableContext items={normalBlogs.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {normalBlogs.map((blog, idx) => (
                  <BlogCardHorizontal
                    key={blog.id}
                    blog={blog}
                    onEdit={() => setEditingBlog(blog)}
                    onDelete={() => handleDeleteBlog(blog.id)}
                    onToggleVisibility={() => handleToggleVisibility(blog.id, blog.is_published)}
                    onToggleFeatured={() => handleToggleFeatured(blog.id, blog.is_featured)}
                    orderIndex={idx + 1}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      )}

      {!loading && filteredBlogs.length === 0 && blogs.length > 0 && (
        <div className="text-center py-10 text-zinc-600 italic">
          Không tìm thấy bài viết nào phù hợp...
        </div>
      )}
    </div>
  );
}

// ─── Horizontal Blog Card ─────────────────────────────

type BlogCardHorizontalProps = {
  blog: DbBlog;
  isFeatured?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleFeatured: () => void;
  orderIndex?: number;
};

function BlogCardHorizontal({
  blog,
  isFeatured,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  orderIndex,
}: BlogCardHorizontalProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blog.id, disabled: isFeatured });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-stretch gap-4 p-4 rounded-2xl border transition-all duration-300 group relative",
        isFeatured
          ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
          : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700",
        isDragging && "scale-[1.02] border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
      )}
    >
      {/* Order controls / Drag handle (non-featured only) */}
      {!isFeatured && (
        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all cursor-grab active:cursor-grabbing"
            title="Kéo thả để sắp xếp"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-zinc-600 tabular-nums">
            {orderIndex}
          </span>
        </div>
      )}

      {/* Featured badge indicator */}
      {isFeatured && (
        <div className="flex items-center justify-center shrink-0 w-8">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800/50 shrink-0 self-center">
        {blog.image_url ? (
          <img
            src={blog.image_url}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-zinc-700" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-zinc-200 truncate">{blog.title}</h3>
          {!(blog.is_published ?? true) && (
            <span className="text-[9px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded uppercase shrink-0">
              Ẩn
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 line-clamp-1">{blog.excerpt}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {blog.slug && (
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded truncate max-w-[180px]">
              /blog/{blog.slug}
            </span>
          )}
          {blog.tags?.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded"
            >
              {tag}
            </span>
          ))}
          <span className="text-[9px] text-zinc-600 ml-auto shrink-0">
            {new Date(blog.created_at).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleFeatured}
          className={cn(
            "p-2 rounded-xl transition-all",
            blog.is_featured
              ? "text-amber-400 hover:bg-amber-500/10"
              : "text-zinc-600 hover:text-amber-400 hover:bg-zinc-800"
          )}
          title={blog.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
        >
          <Star className={cn("w-4 h-4", blog.is_featured && "fill-amber-400")} />
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          title="Chỉnh sửa"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleVisibility}
          className={cn(
            "p-2 rounded-xl transition-all",
            (blog.is_published ?? true)
              ? "text-emerald-400 hover:bg-emerald-500/10"
              : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
          )}
          title={(blog.is_published ?? true) ? "Ẩn bài" : "Hiện bài"}
        >
          {(blog.is_published ?? true) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <a
          href={`/blog/${blog.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all"
          title="Xem bài viết"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
