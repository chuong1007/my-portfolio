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

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";

const BLOG_TAGS = [
  "All",
  "Branding",
  "UI/UX Design",
  "Graphic Design",
  "AI Tools",
  "Digital Marketing",
  "Content Strategy",
  "Storytelling",
  "Minimalism",
  "Typography",
  "Career Tips",
  "AI Innovation"
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
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("128");
  const [itemsToShowData, setItemsToShowData] = useState<ResponsiveValue>(null);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [seeAllLabel, setSeeAllLabel] = useState("Xem tất cả bài viết");
  const [seeAllLink, setSeeAllLink] = useState("/blog");
  const { isAdmin, globalPreviewMode } = useAdmin();

  const fetchContent = async () => {
    // Prevent overwrite if realtime data is already active
    if ((window as any)._blogRealtimeActive) return;

    try {
      const supabase = createClient();
      const { data } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (data?.data) {
        const d = data.data as any;
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.itemsToShow !== undefined) setItemsToShowData(d.itemsToShow);
        if (d.showSeeAll !== undefined) setShowSeeAll(d.showSeeAll);
        if (d.seeAllLabel !== undefined) setSeeAllLabel(d.seeAllLabel);
        if (d.seeAllLink !== undefined) setSeeAllLink(d.seeAllLink);
      }
    } catch (e) {
      console.error("Blog visibility error:", e);
    }
  };

  useEffect(() => {
    async function fetchBlogs() {
      const supabase = createClient();
      
      const { data: authData } = await supabase.auth.getUser();

      let query = supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      // If not admin, only show published posts
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        query = query.eq("is_published", true);
      }

      const { data } = await query;

      if (data) setBlogs(data);
      setLoading(false);
    }
    fetchBlogs();
    fetchContent();
  }, []);

  // Listen for real-time preview updates from AdminModal
  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._blogRealtimeActive = true;
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
      if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
      if (d.itemsToShow !== undefined) setItemsToShowData(d.itemsToShow);
      if (d.showSeeAll !== undefined) setShowSeeAll(d.showSeeAll);
      if (d.seeAllLabel !== undefined) setSeeAllLabel(d.seeAllLabel);
      if (d.seeAllLink !== undefined) setSeeAllLink(d.seeAllLink);
    };

    const handlePreviewUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.sectionId === sectionId) {
        applyUpdate(customEvent.detail.data);
      }
    };

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_UPDATE' && event.data.sectionId === sectionId) {
        applyUpdate(event.data.data);
      }
    };

    window.addEventListener('previewUpdate', handlePreviewUpdate);
    window.addEventListener('message', handleParentMessage);
    
    return () => {
      window.removeEventListener('previewUpdate', handlePreviewUpdate);
      window.removeEventListener('message', handleParentMessage);
    };
  }, [sectionId]);

  // Use fixed trending tags for filters
  const allTags = BLOG_TAGS;

  // Filter blogs by active tag
  const filteredBlogsTotal = useMemo(() => {
    return activeTag === "All" ? blogs : blogs.filter((b) => b.tags?.includes(activeTag));
  }, [blogs, activeTag]);

  // Get items count based on responsive value or defaults
  const currentDevice = globalPreviewMode ?? 'desktop';
  const defaultCount = variant === 'homepage' 
    ? (currentDevice === 'mobile' ? 5 : currentDevice === 'tablet' ? 6 : 3)
    : 50;
  // Defensive itemsToShow
  const itemsToShow = Math.max(1, parseInt(getResponsiveValue(itemsToShowData, currentDevice, defaultCount.toString())) || defaultCount);

  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(filteredBlogsTotal)) return [];
    return filteredBlogsTotal.slice(0, itemsToShow);
  }, [filteredBlogsTotal, itemsToShow]);

  const featured = variant === 'homepage' 
    ? (filteredBlogsTotal?.find((p) => p.featured) || filteredBlogsTotal?.[0])
    : null; 
  
  const sidePosts = variant === 'homepage'
    ? (Array.isArray(filteredBlogsTotal) ? filteredBlogsTotal.filter((p) => p && p.id !== featured?.id).slice(0, Math.max(0, itemsToShow - 1)) : [])
    : filteredBlogs;

  if (!isVisible && !isAdmin) return null;

  const initialData = { 
    isVisible, 
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData,
    itemsToShow: itemsToShowData,
    showSeeAll,
    seeAllLabel,
    seeAllLink
  };

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section 
        id={sectionId} 
        className="px-6 md:px-12 bg-zinc-950 relative"
        style={{
          paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 0}px`
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{
            paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`
          }}
        >
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
          
          {variant === 'homepage' && !showSeeAll && (
            <Link 
              href="/blog"
              className="hidden lg:flex group items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
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
          {/* Homepage Layout */}
          {variant === 'homepage' && (
            <>
              {/* Desktop Layout: 1 Large, 2 Side Posts (Tighter gap) */}
              <div className="hidden lg:grid grid-cols-2 gap-16">
                {/* Left Column: Featured Post */}
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
                          className="w-full h-[330px] object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
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
                        <h3 className="text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight mb-4 tracking-tighter">
                          {featured.title}
                        </h3>
                        <p className="text-zinc-500 text-base leading-relaxed line-clamp-2">
                          {featured.excerpt}
                        </p>
                      </div>
                    </Link>
                    )}
                  </motion.div>
                </div>

                {/* Right Column: 2 Side Posts */}
                <div className="flex flex-col gap-12 justify-center">
                  {sidePosts.slice(0, 2).map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="group"
                    >
                      <Link href={`/blog/${post.slug}`} className="flex flex-row gap-8 items-center">
                        <div className="w-[50%] relative aspect-[4/2.8] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              {post.tags?.[0] || "Blog"}
                            </span>
                          </div>
                          <h4 className="text-2xl font-bold text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-3 tracking-tight">
                            {post.title}
                          </h4>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </div>

              {/* Tablet & Mobile Layout: Regular Grid */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {filteredBlogs.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-6">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 font-bold tracking-widest uppercase">
                          {post.tags?.[0] || "Blog"}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase ml-auto">
                          {new Date(post.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight mb-3">
                        {post.title}
                      </h3>
                      <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </>
          )}

          {/* Subpage Layout: Structured 3 Columns */}
          {variant === 'subpage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="group flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <div className="w-full aspect-video overflow-hidden rounded-2xl bg-zinc-800">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                      {isAdmin && !post.is_published && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded-md border border-zinc-700 font-bold uppercase ml-auto">
                          Bản nháp
                        </span>
                      )}
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

      {/* See All Button / Fallback mobile link */}
      {(showSeeAll || (!showSeeAll && variant === 'homepage')) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "mt-16 flex justify-center",
            !showSeeAll && "lg:hidden" // Hide on desktop if not explicitly enabled (as it's in the header)
          )}
        >
          {showSeeAll ? (
            <Link 
              href={seeAllLink}
              className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
                  {typeof seeAllLabel === 'string' ? seeAllLabel : String(seeAllLabel)}
                </span>
              <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-100 flex items-center justify-center transition-all duration-500 group-hover:rotate-[-45deg]">
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950" />
              </div>
            </Link>
          ) : (
            <Link 
              href="/blog"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border border-zinc-800 px-6 py-3 rounded-full hover:border-zinc-500"
            >
              Xem tất cả bài viết
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>
      )}

      {/* Empty state for filtered results */}
      {!loading && filteredBlogs.length === 0 && blogs.length > 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-lg">Không có bài viết nào với tag &quot;{activeTag}&quot;</p>
        </div>
      )}
    </div>
    </section>
    </SectionEditor>
  );
}
