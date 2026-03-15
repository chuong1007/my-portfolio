"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

const BLOG_TAGS = [
  "All",
  "Human-Centric",
  "AI-Partnered",
  "Neo-Minimalism",
  "Spatial UI",
  "Motion Kinetic",
  "Eco-Design",
  "Retro-Futurism",
  "Experimental Type",
  "Chaos Branding",
  "Tactile Visuals"
];

type BlogProps = {
  variant?: 'homepage' | 'subpage';
  sectionId?: string;
};

export function Blog({ variant = 'homepage', sectionId = 'blog' }: BlogProps) {
  const [blogs, setBlogs] = useState<DbBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [isVisible, setIsVisible] = useState(true);
  const { isAdmin, isEditMode } = useAdmin();

  const fetchContent = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (data?.data) {
        const d = data.data as { isVisible?: boolean };
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      }
    } catch (e) {
      console.error("Blog visibility error:", e);
    }
  };

  useEffect(() => {
    async function fetchBlogs() {
      const supabase = createClient();
      
      const { data: authData } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setBlogs(data);
      setLoading(false);
    }
    fetchBlogs();
    fetchContent();
  }, []);

  // Use fixed trending tags for filters
  const allTags = BLOG_TAGS;

  // Filter blogs by active tag
  const filteredBlogs = useMemo(() => {
    let result = activeTag === "All" ? blogs : blogs.filter((b) => b.tags?.includes(activeTag));
    
    // If homepage, limit to 3 posts
    if (variant === 'homepage') {
      return result.slice(0, 3);
    }
    return result;
  }, [blogs, activeTag, variant]);

  const featured = variant === 'homepage' 
    ? (filteredBlogs.find((p) => p.featured) || filteredBlogs[0])
    : null; // Pinterest layout doesn't need featured highlight usually, or we can keep it. User said Pinterest layout for subpage.
  
  const sidePosts = variant === 'homepage'
    ? filteredBlogs.filter((p) => p.id !== featured?.id)
    : filteredBlogs;

  if (!isVisible && !isAdmin) return null;

  return (
      <SectionEditor 
        sectionId={sectionId} 
        initialData={{ isVisible }} 
        onSave={fetchContent} 
        isVisible={isVisible}
        extraActions={
          isAdmin && isEditMode && variant === 'homepage' ? (
            <Link
              href="/admin/blogs"
              className="px-4 py-3 bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 border border-zinc-700/50 rounded-full transition-all duration-300 shadow-xl group/admin-btn"
            >
              <span className="text-[10px] font-bold text-zinc-400 group-hover/admin-btn:text-white uppercase tracking-widest">
                Quản lý bài viết
              </span>
            </Link>
          ) : null
        }
      >
        <section id="blog" className="py-24 px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-row items-end justify-between border-b border-zinc-900 pb-8"
        >
          <div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-50 mb-2">Blog</h2>
            <p className="text-lg md:text-xl text-zinc-500 font-medium">Chia sẻ kiến thức</p>
          </div>
          
          {variant === 'homepage' && (
            <Link 
              href="/blog"
              className="group flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>

      {/* Tag Filters */}
      {!loading && blogs.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {allTags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                  isActive
                    ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-zinc-200"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Blog Grid: balanced layout */}
      {!loading && filteredBlogs.length > 0 && (
        <div className="flex flex-col gap-12">
          {/* Homepage Layout: Featured + Side (1 Large, 2 Small Horizontal Side-by-side) */}
          {variant === 'homepage' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left Column: Featured Post (Balanced width & height) */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {featured && (
                  <Link href={`/blog/${featured.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800">
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-[320px] md:h-[330px] object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute bottom-6 left-6 flex items-center gap-2 px-6 py-3 border border-zinc-50 rounded-full text-sm font-medium text-zinc-50 backdrop-blur-md bg-white/10">
                          Đọc bài viết
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        {featured.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 font-bold tracking-widest uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase ml-auto">
                          {new Date(featured.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight mb-4 tracking-tighter">
                        {featured.title}
                      </h3>
                      <p className="text-zinc-500 text-sm md:text-base leading-relaxed line-clamp-2">
                        {featured.excerpt}
                      </p>
                    </div>
                  </Link>
                  )}
                </motion.div>
              </div>

              {/* Right Column: 2 Side Posts (Horizontal Layout: Tighter gap) */}
              <div className="flex flex-col gap-12 justify-center">
                {sidePosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex flex-row gap-8 items-center">
                      <div className="w-[54%] relative aspect-[4/2.85] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {post.tags?.[0] || "Blog"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {new Date(post.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <h4 className="text-xl md:text-2xl font-bold text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-4 tracking-tight">
                          {post.title}
                        </h4>
                        <p className="hidden md:line-clamp-2 text-zinc-500 text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          {/* Subpage Layout: Pinterest 3 Columns */}
          {variant === 'subpage' && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredBlogs.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="break-inside-avoid group flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="w-full overflow-hidden rounded-2xl bg-zinc-800">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        {post.tags?.[0] || "Blog"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors leading-tight">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state for filtered results */}
      {!loading && filteredBlogs.length === 0 && blogs.length > 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-lg">Không có bài viết nào với tag &quot;{activeTag}&quot;</p>
        </div>
      )}
    </section>
    </SectionEditor>
  );
}
