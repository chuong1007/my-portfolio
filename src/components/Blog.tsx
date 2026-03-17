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
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();

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

  const desktopCols = getResponsiveValue(columnsData, 'desktop') || "3";
  const tabletCols = getResponsiveValue(columnsData, 'tablet') || "2";
  const mobileCols = getResponsiveValue(columnsData, 'mobile') || "1";

  const ptDesk = getResponsiveValue(paddingTopData, 'desktop') || 0;
  const ptTab = getResponsiveValue(paddingTopData, 'tablet') || 0;
  const ptMob = getResponsiveValue(paddingTopData, 'mobile') || 0;

  const pbDesk = getResponsiveValue(paddingBottomData, 'desktop') || 0;
  const pbTab = getResponsiveValue(paddingBottomData, 'tablet') || 0;
  const pbMob = getResponsiveValue(paddingBottomData, 'mobile') || 0;

  const isEditor = isAdmin && isEditMode;
  const currentCols = getResponsiveValue(columnsData, globalPreviewMode || 'desktop') || "1";
  const currentPt = getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0;
  const currentPb = getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 0;

  const currentSeeAllPos = getResponsiveValue(seeAllPositionData, currentDevice) || 'bottom';

  const getGridColsClass = (cols: any, device: 'mobile' | 'tablet' | 'desktop') => {
    const c = parseInt(cols?.toString() || "1") || 1;
    if (device === 'mobile') {
      if (c <= 1) return "grid-cols-1";
      if (c === 2) return "grid-cols-2";
      if (c === 3) return "grid-cols-3";
      return "grid-cols-4";
    }
    if (device === 'tablet') {
      if (c <= 1) return "md:grid-cols-1";
      if (c === 2) return "md:grid-cols-2";
      if (c === 3) return "md:grid-cols-3";
      return "md:grid-cols-4";
    }
    if (c <= 1) return "lg:grid-cols-1";
    if (c === 2) return "lg:grid-cols-2";
    if (c === 3) return "lg:grid-cols-3";
    return "lg:grid-cols-4";
  };

  const gridClass = isEditor 
    ? getGridColsClass(currentCols, 'mobile').replace('lg:', '').replace('md:', '')
    : `${getGridColsClass(mobileCols, 'mobile')} ${getGridColsClass(tabletCols, 'tablet')} ${getGridColsClass(desktopCols, 'desktop')}`;

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section 
        id={sectionId} 
        className={cn(
          "px-4 md:px-12 bg-zinc-950 relative",
          !isEditor && "pt-[var(--pt-mob)] md:pt-[var(--pt-tab)] lg:pt-[var(--pt-desk)]",
          !isEditor && "pb-[var(--pb-mob)] md:pb-[var(--pb-tab)] lg:pb-[var(--pb-desk)]"
        )}
        style={{
          paddingTop: isEditor ? `${currentPt}px` : undefined,
          paddingBottom: isEditor ? `${currentPb}px` : undefined,
          "--pt-desk": `${ptDesk}px`,
          "--pt-tab": `${ptTab}px`,
          "--pt-mob": `${ptMob}px`,
          "--pb-desk": `${pbDesk}px`,
          "--pb-tab": `${pbTab}px`,
          "--pb-mob": `${pbMob}px`,
        } as any}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-row items-end justify-between border-b border-zinc-900 pb-8"
          >
            <div className="flex flex-col gap-2">
              <div 
                className={cn(
                  "tracking-tighter text-zinc-50 whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  !isEditor && "text-[length:var(--b-fs-mob)] md:text-[length:var(--b-fs-tab)] lg:text-[length:var(--b-fs-desk)] leading-[var(--b-lh-mob)] md:leading-[var(--b-lh-tab)] lg:leading-[var(--b-lh-desk)] [font-family:var(--b-ff-mob)] md:[font-family:var(--b-ff-tab)] lg:[font-family:var(--b-ff-desk)] font-[var(--b-fw-mob)] md:font-[var(--b-fw-tab)] lg:font-[var(--b-fw-desk)]"
                )}
                style={{ 
                  fontSize: isEditor ? `${titleData.fontSize?.[globalPreviewMode || 'desktop'] || 48}px` : undefined,
                  lineHeight: isEditor ? (titleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                  fontFamily: isEditor ? (titleData.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                  fontWeight: isEditor ? (titleData.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                  "--b-fs-desk": `${titleData.fontSize?.desktop || 48}px`,
                  "--b-fs-tab": `${titleData.fontSize?.tablet || 40}px`,
                  "--b-fs-mob": `${titleData.fontSize?.mobile || 32}px`,
                  "--b-lh-desk": titleData.lineHeight?.desktop || '1.1',
                  "--b-lh-tab": titleData.lineHeight?.tablet || '1.1',
                  "--b-lh-mob": titleData.lineHeight?.mobile || '1.1',
                  "--b-ff-desk": titleData.fontFamily?.desktop || 'inherit',
                  "--b-ff-tab": titleData.fontFamily?.tablet || 'inherit',
                  "--b-ff-mob": titleData.fontFamily?.mobile || 'inherit',
                  "--b-fw-desk": titleData.fontWeight?.desktop || '700',
                  "--b-fw-tab": titleData.fontWeight?.tablet || '700',
                  "--b-fw-mob": titleData.fontWeight?.mobile || '700',
                } as any}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData.content, globalPreviewMode || 'desktop') || "" }} 
              />
              <div 
                className={cn(
                  "text-zinc-500 whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  !isEditor && "text-[length:var(--bs-fs-mob)] md:text-[length:var(--bs-fs-tab)] lg:text-[length:var(--bs-fs-desk)] leading-[var(--bs-lh-mob)] md:leading-[var(--bs-lh-tab)] lg:leading-[var(--bs-lh-desk)]"
                )}
                style={{ 
                  fontSize: isEditor ? `${subtitleData.fontSize?.[globalPreviewMode || 'desktop'] || 18}px` : undefined,
                  lineHeight: isEditor ? (subtitleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.5') : undefined,
                  "--bs-fs-desk": `${subtitleData.fontSize?.desktop || 18}px`,
                  "--bs-fs-tab": `${subtitleData.fontSize?.tablet || 16}px`,
                  "--bs-fs-mob": `${subtitleData.fontSize?.mobile || 14}px`,
                  "--bs-lh-desk": subtitleData.lineHeight?.desktop || '1.5',
                  "--bs-lh-tab": subtitleData.lineHeight?.tablet || '1.5',
                  "--bs-lh-mob": subtitleData.lineHeight?.mobile || '1.5',
                } as any}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData.content, globalPreviewMode || 'desktop') || "" }} 
              />
            </div>
            {((showSeeAll && currentSeeAllPos === 'top') || (variant === 'homepage' && !showSeeAll)) && (
              <Link 
                href={showSeeAll ? (getResponsiveValue(seeAllLink, currentDevice) || "/blog") : "/blog"}
                className="hidden lg:flex group items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
              >
                {showSeeAll ? (getResponsiveValue(seeAllLabel, currentDevice) || "Xem tất cả") : "Xem tất cả"}
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
            <div 
              className={cn(
                "grid",
                !isEditor && "gap-6 md:gap-8",
                gridClass
              )}
              style={{
                gap: isEditor ? (currentDevice === 'mobile' ? '1.5rem' : '2rem') : undefined,
                '--cols-mob': mobileCols,
                '--cols-tab': tabletCols,
                '--cols-desk': desktopCols
              } as any}
            >
              {filteredBlogs.map((post, index) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  index={index} 
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
                <Link href={getResponsiveValue(seeAllLink, currentDevice) || seeAllLink || "/blog"} className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden w-full md:w-auto text-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
                    {getResponsiveValue(seeAllLabel, currentDevice) || seeAllLabel}
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

function BlogCard({ post, index }: { post: DbBlog; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl transition-all duration-300 p-5 hover:bg-zinc-800/50 h-full"
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col w-full h-full">
        <div className="overflow-hidden bg-zinc-800 w-full aspect-video rounded-2xl mb-6 relative">
          {post.is_featured && (
            <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-md absolute top-3 left-3 z-10 shadow-lg tracking-wider">
              NỔI BẬT
            </div>
          )}
          <img
            src={post.image_url}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span>{post.tags?.[0] || "Blog"}</span>
          </div>
          <h3 className="font-bold text-zinc-100 mb-4 group-hover:text-white transition-colors leading-tight text-xl line-clamp-2">
            {post.title}
          </h3>
          <p className="text-zinc-500 leading-relaxed text-sm line-clamp-2 mt-auto">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
