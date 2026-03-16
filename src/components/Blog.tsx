"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "./RichTextEditor";

const normalize = (val: any): RichTextData => {
  const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
  const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
  
  if (typeof val === 'object' && val !== null && 'content' in val) {
    return {
      ...val,
      fontSize: val.fontSize || defaultFS,
      lineHeight: val.lineHeight || defaultLH
    };
  }
  return { 
    content: val || '', 
    fontSize: defaultFS,
    lineHeight: defaultLH
  };
};

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
  const [titleData, setTitleData] = useState<RichTextData>({ content: "Blog", fontSize: { desktop: 48, tablet: 40, mobile: 32 }, lineHeight: { desktop: "1.2", tablet: "1.2", mobile: "1.2" } });
  const [subtitleData, setSubtitleData] = useState<RichTextData>({ content: "Chia sẻ kiến thức & trải nghiệm", fontSize: { desktop: 18, tablet: 16, mobile: 14 }, lineHeight: { desktop: "1.5", tablet: "1.5", mobile: "1.5" } });
  const [columnsData, setColumnsData] = useState<ResponsiveValue>("3");
  const [seeAllPositionData, setSeeAllPositionData] = useState<ResponsiveValue>("bottom");
  const { isAdmin, globalPreviewMode } = useAdmin();

  const fetchContent = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (data?.data) {
        const d = data.data as any;
        if (d.title !== undefined) setTitleData(normalize(d.title));
        if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.itemsToShow !== undefined) setItemsToShowData(d.itemsToShow);
        if (d.showSeeAll !== undefined) setShowSeeAll(d.showSeeAll);
        if (d.seeAllLabel !== undefined) setSeeAllLabel(d.seeAllLabel);
        if (d.seeAllLink !== undefined) setSeeAllLink(d.seeAllLink);
        if (d.seeAllPosition !== undefined) setSeeAllPositionData(d.seeAllPosition);
        if (d.columns !== undefined) setColumnsData(d.columns);
      }
    } catch (e) {
      console.error("Blog visibility error:", e);
    }
  }, [sectionId]);

  useEffect(() => {
    async function fetchBlogs() {
      const supabase = createClient();
      let query = supabase.from("blogs").select("*").order("created_at", { ascending: false });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) query = query.eq("is_published", true);
      const { data } = await query;
      if (data) setBlogs(data);
      setLoading(false);
    }
    fetchBlogs();
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._blogRealtimeActive = true;
      if (d.title !== undefined) setTitleData(normalize(d.title));
      if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
      if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
      if (d.itemsToShow !== undefined) setItemsToShowData(d.itemsToShow);
      if (d.showSeeAll !== undefined) setShowSeeAll(d.showSeeAll);
      if (d.seeAllLabel !== undefined) setSeeAllLabel(d.seeAllLabel);
      if (d.seeAllLink !== undefined) setSeeAllLink(d.seeAllLink);
      if (d.seeAllPosition !== undefined) setSeeAllPositionData(d.seeAllPosition);
      if (d.columns !== undefined) setColumnsData(d.columns);
    };

    const handlePreviewUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.sectionId === sectionId) applyUpdate(customEvent.detail.data);
    };

    window.addEventListener('previewUpdate', handlePreviewUpdate);
    return () => window.removeEventListener('previewUpdate', handlePreviewUpdate);
  }, [sectionId]);

  const currentDevice = globalPreviewMode ?? 'desktop';
  const defaultCount = variant === 'homepage' 
    ? (currentDevice === 'mobile' ? 5 : currentDevice === 'tablet' ? 6 : 3)
    : 50;
  const itemsToShow = Math.max(1, parseInt(getResponsiveValue(itemsToShowData, currentDevice, defaultCount.toString())) || defaultCount);

  const filteredBlogs = useMemo(() => {
    const base = activeTag === "All" ? blogs : blogs.filter((b) => b.tags?.includes(activeTag));
    return base.slice(0, itemsToShow);
  }, [blogs, activeTag, itemsToShow]);

  if (!isVisible && !isAdmin) return null;

  const initialData = { 
    isVisible, 
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData,
    title: titleData,
    subtitle: subtitleData,
    itemsToShow: itemsToShowData,
    showSeeAll,
    seeAllLabel,
    seeAllLink,
    seeAllPosition: seeAllPositionData,
    columns: columnsData
  };

  const desktopCols = parseInt(getResponsiveValue(columnsData, 'desktop') || "3");
  const tabletCols = parseInt(getResponsiveValue(columnsData, 'tablet') || "2");
  const mobileCols = parseInt(getResponsiveValue(columnsData, 'mobile') || "1");

  const currentSeeAllPos = getResponsiveValue(seeAllPositionData, currentDevice) || 'bottom';

  const gridColsClass = cn(
    `grid-cols-${mobileCols}`,
    `md:grid-cols-${tabletCols}`,
    `lg:grid-cols-${desktopCols}`
  );

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section 
        id={sectionId} 
        className="px-6 md:px-12 bg-zinc-950 relative"
        style={{
          paddingBottom: `${getResponsiveValue(paddingBottomData, currentDevice) || 0}px`
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{
            paddingTop: `${getResponsiveValue(paddingTopData, currentDevice) || 0}px`
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-row items-end justify-between border-b border-zinc-900 pb-8"
          >
            <div className="flex flex-col gap-2">
              <div 
                className="font-bold tracking-tighter text-zinc-50 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0" 
                style={{ fontSize: `${titleData.fontSize?.[globalPreviewMode || 'desktop'] || 48}px` }}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData, globalPreviewMode || 'desktop') }} 
              />
              <div 
                className="text-zinc-500 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0" 
                style={{ fontSize: `${subtitleData.fontSize?.[globalPreviewMode || 'desktop'] || 18}px` }}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData, globalPreviewMode || 'desktop') }} 
              />
            </div>
            {((showSeeAll && currentSeeAllPos === 'top') || (variant === 'homepage' && !showSeeAll)) && (
              <Link 
                href={showSeeAll ? seeAllLink : "/blog"}
                className="hidden lg:flex group items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
              >
                {showSeeAll ? seeAllLabel : "Xem tất cả"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          {!loading && blogs.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-10">
              {BLOG_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                    activeTag === tag
                      ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                      : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {!loading && filteredBlogs.length > 0 && (
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12",
              gridColsClass
            )}>
              {filteredBlogs.map((post, index) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  index={index} 
                  isFeatured={variant === 'homepage' && index === 0 && currentDevice === 'desktop' && desktopCols === 3}
                />
              ))}
            </div>
          )}

          {((showSeeAll && currentSeeAllPos === 'bottom') || (variant === 'homepage' && !showSeeAll)) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn("mt-20 flex justify-center", !showSeeAll && "lg:hidden")}
            >
              {showSeeAll ? (
                <Link href={seeAllLink} className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden w-full md:w-auto text-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
                    {seeAllLabel}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-100 flex items-center justify-center transition-all duration-500 group-hover:rotate-[-45deg] shrink-0">
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950" />
                  </div>
                </Link>
              ) : (
                <Link href="/blog" className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border border-zinc-800 px-6 py-3 rounded-full hover:border-zinc-500 w-full md:w-auto text-center justify-center">
                  Xem tất cả bài viết
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          )}

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

function BlogCard({ post, index, isFeatured }: { post: DbBlog; index: number; isFeatured?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "group flex bg-zinc-900 border border-zinc-800 rounded-3xl transition-all duration-300",
        isFeatured 
          ? "col-span-1 lg:col-span-2 row-span-2 flex-col lg:flex-row p-0 overflow-hidden" 
          : "flex-col p-5 hover:bg-zinc-800/50"
      )}
    >
      <Link href={`/blog/${post.slug}`} className={cn("flex w-full h-full", isFeatured ? "flex-col lg:flex-row" : "flex-col")}>
        <div className={cn(
          "overflow-hidden bg-zinc-800",
          isFeatured 
            ? "w-full lg:w-3/5 h-[300px] lg:h-auto" 
            : "w-full aspect-video rounded-2xl mb-6"
        )}>
          <img
            src={post.image_url}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className={cn(
          "flex flex-col justify-center",
          isFeatured ? "p-8 lg:p-12 w-full lg:w-2/5" : ""
        )}>
          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span>{post.tags?.[0] || "Blog"}</span>
          </div>
          <h3 className={cn(
            "font-bold text-zinc-100 mb-4 group-hover:text-white transition-colors leading-tight",
            isFeatured ? "text-3xl lg:text-4xl" : "text-2xl line-clamp-2"
          )}>
            {post.title}
          </h3>
          <p className={cn(
            "text-zinc-500 leading-relaxed",
            isFeatured ? "text-lg line-clamp-3" : "text-base line-clamp-2"
          )}>
            {post.excerpt}
          </p>
          
          {isFeatured && (
            <div className="mt-8 flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
              Đọc tiếp
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
