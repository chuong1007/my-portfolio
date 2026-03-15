"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAdmin } from "@/context/AdminContext";
import type { DbBlog } from "@/lib/types";

export function BlogDetail({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<DbBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isEditMode } = useAdmin();

  useEffect(() => {
    async function fetchBlog() {
      const supabase = createClient();
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setBlog(data);
      }
      
      setLoading(false);
    }
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-zinc-50 mb-4">
          Bài viết không tồn tại
        </h1>
        <p className="text-zinc-400 mb-8">
          Có vẻ như bài viết này đã bị xóa hoặc đường dẫn không hợp lệ.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-zinc-50 text-zinc-950 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full pt-28 pb-12">
      <article className="max-w-4xl mx-auto px-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Blogs</span>
          </Link>

          {isAdmin && isEditMode && (
            <Link
              href={`/admin/blogs?edit=${blog.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-zinc-300" />
              <span className="text-sm font-medium text-zinc-300">Chỉnh sửa</span>
            </Link>
          )}
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-6">
             <div className="flex gap-2">
               {blog.tags?.map((tag) => (
                 <span
                   key={tag}
                   className="text-xs px-3 py-1 bg-zinc-800/50 text-emerald-400 rounded-full border border-zinc-800"
                 >
                   {tag}
                 </span>
               ))}
             </div>
             <span className="w-1 h-1 rounded-full bg-zinc-700" />
             <div className="flex items-center gap-2 text-sm text-zinc-500">
               <Calendar className="w-4 h-4" />
               {new Date(blog.created_at).toLocaleDateString("vi-VN", {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric'
               })}
             </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-50 tracking-tight leading-tight mb-6">
            {blog.title}
          </h1>

          <p className="text-xl text-zinc-400 leading-relaxed">
            {blog.excerpt}
          </p>
        </header>

        {/* Hero Image */}
        {blog.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-video rounded-3xl overflow-hidden mb-16 bg-zinc-900"
          >
            <img
              src={blog.image_url}
              alt={blog.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none text-zinc-300 custom-tiptap-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </main>
  );
}
