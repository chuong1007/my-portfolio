"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { BlogForm } from "@/components/admin/BlogForm";
import Link from "next/link";

export default function AdminBlogsPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [blogs, setBlogs] = useState<DbBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<DbBlog | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: blogsData } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (blogsData) {
      setBlogs(blogsData);

      if (editId) {
        const blogToEdit = blogsData.find((b) => b.id === editId);
        if (blogToEdit) {
          setEditingBlog(blogToEdit);
        }
      }
    }
    setLoading(false);
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

  const handleFormClose = () => {
    setShowBlogForm(false);
    setEditingBlog(null);
    fetchData();
  };

  if (showBlogForm || editingBlog) {
    return (
      <BlogForm
        blog={editingBlog}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Quản Lý Blog</h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Tạo, chỉnh sửa và quản lý tất cả bài viết blog.
          </p>
        </div>
        <button
          onClick={() => setShowBlogForm(true)}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Thêm bài viết mới
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg">Chưa có bài viết nào</p>
          <p className="text-zinc-600 text-sm mt-1">Nhấn "Thêm bài viết mới" để bắt đầu</p>
        </div>
      )}

      {/* Blog List */}
      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group"
            >
              {/* Cover */}
              <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                {blog.image_url ? (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-zinc-700" />
                  </div>
                )}
                {blog.featured && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Nổi bật
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-zinc-200 mb-1">{blog.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{blog.excerpt}</p>

                {/* Slug */}
                {blog.slug && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-1 rounded-md truncate max-w-full">
                      /blog/{blog.slug}
                    </span>
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {blog.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                  >
                    <Pencil className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                  <span className="ml-auto text-xs text-zinc-600">
                    {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
