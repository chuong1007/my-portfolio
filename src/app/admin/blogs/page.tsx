"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Image as ImageIcon, ArrowLeft, Eye, EyeOff, Search, Newspaper } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleToggleVisibility = async (id: string, currentStatus: boolean | undefined) => {
    const supabase = createClient();
    await supabase
      .from("blogs")
      .update({ is_published: !(currentStatus ?? true) })
      .eq("id", id);
    fetchData();
  };

  const handleFormClose = () => {
    setShowBlogForm(false);
    setEditingBlog(null);
    fetchData();
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (blog.slug && blog.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (showBlogForm || editingBlog) {
    return (
      <BlogForm
        blog={editingBlog}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER SECTION */}
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
        <button
          onClick={() => setShowBlogForm(true)}
          className="flex items-center gap-2 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-white/5 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Tạo Bài Viết Mới
        </button>
      </div>

      {/* FILTER & SEARCH */}
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

      {/* Blog List */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg font-medium">Chưa có bài viết nào</p>
          <p className="text-zinc-600 text-sm mt-1">Nhấn "Tạo Bài Viết Mới" để bắt đầu</p>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full text-center py-10 text-zinc-600 italic">
              Không tìm thấy bài viết nào phù hợp...
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5"
              >
                {/* Cover */}
                <div className="aspect-[16/10] bg-zinc-800/50 overflow-hidden relative">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-zinc-700" />
                    </div>
                  )}
                  {blog.featured && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
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
                      onClick={() => handleToggleVisibility(blog.id, blog.is_published)}
                      className={`flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800 ${
                        (blog.is_published ?? true) 
                          ? "text-emerald-400 hover:text-emerald-300" 
                          : "text-zinc-500 hover:text-zinc-400"
                      }`}
                    >
                      {(blog.is_published ?? true) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {(blog.is_published ?? true) ? "Công khai" : "Đang ẩn"}
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 ml-auto md:ml-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                    <span className="ml-auto text-xs text-zinc-600 hidden md:block">
                      {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
