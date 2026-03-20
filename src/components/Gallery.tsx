"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { getAllProjects } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
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

const CATEGORIES = ["All", "Poster", "Branding", "Logo Design", "UX/UI"];

// Use cached projects from data layer
const MOCK_PROJECTS = getAllProjects();

type GalleryProps = {
  sectionId?: string;
  variant?: 'homepage' | 'subpage';
};

export function Gallery({ sectionId = "gallery", variant = 'homepage' }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(true);
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("128");
  const [itemsToShowData, setItemsToShowData] = useState<ResponsiveValue>(null);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [seeAllLabel, setSeeAllLabel] = useState("Xem tất cả dự án");
  const [seeAllLink, setSeeAllLink] = useState("/projects");
  const [seeAllPositionData, setSeeAllPositionData] = useState<ResponsiveValue>("bottom");
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [titleData, setTitleData] = useState<RichTextData>({ content: "Dự án", fontSize: { desktop: 48, tablet: 40, mobile: 32 }, lineHeight: { desktop: "1.2", tablet: "1.2", mobile: "1.2" } });
  const [subtitleData, setSubtitleData] = useState<RichTextData>({ content: "Các dự án thiết kế nổi bật", fontSize: { desktop: 18, tablet: 16, mobile: 14 }, lineHeight: { desktop: "1.5", tablet: "1.5", mobile: "1.5" } });
  const [columnsData, setColumnsData] = useState<ResponsiveValue>("3");
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();

  const [visibleCount, setVisibleCount] = useState(variant === 'subpage' ? 12 : 16);

  const fetchContent = useCallback(async () => {
    try {
      const supabase = createClient();
      
      const { data: sectionData } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (sectionData?.data) {
        const d = sectionData.data as any;
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

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsData) {
        setDbProjects(projectsData);
      }
    } catch (e) {
      console.error("Gallery section error:", e);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._galleryRealtimeActive = true;
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

  const projectsToDisplay = useMemo(() => {
    return dbProjects.length > 0 
      ? dbProjects.filter(p => isAdmin || p.is_visible)
      : MOCK_PROJECTS;
  }, [dbProjects, isAdmin]);

  const filteredProjects = useMemo(() => {
    const base = projectsToDisplay.map(p => ({
      ...p,
      imageUrl: p.cover_image || p.imageUrl, 
      tags: p.tags || []
    }));

    if (activeCategory === "All") return base;
    return base.filter((p) => p.tags.includes(activeCategory));
  }, [activeCategory, projectsToDisplay]);

  const currentDevice = globalPreviewMode ?? 'desktop';
  const itemsToShow = variant === 'homepage' 
    ? Math.max(1, parseInt(getResponsiveValue(itemsToShowData, currentDevice, "16")) || 16)
    : visibleCount;

  const displayedProjects = useMemo(() => {
    if (!Array.isArray(filteredProjects)) return [];
    return filteredProjects.slice(0, itemsToShow);
  }, [filteredProjects, itemsToShow]);

  const hasMore = useMemo(() => {
    return itemsToShow < filteredProjects.length;
  }, [itemsToShow, filteredProjects.length]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

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
    <SectionEditor 
      sectionId={sectionId} 
      initialData={initialData} 
      onSave={fetchContent} 
      isVisible={isVisible}
      extraActions={
        isAdmin && isEditMode ? (
          <Link
            href="/admin?tab=projects"
            className="px-4 py-3 bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 border border-zinc-700/50 rounded-full transition-all duration-300 shadow-xl group/admin-btn"
          >
            <span className="text-[10px] font-bold text-zinc-400 group-hover/admin-btn:text-white uppercase tracking-widest">
              Quản lý dự án
            </span>
          </Link>
        ) : null
      }
    >
      <section 
        id="projects" 
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
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex items-end justify-between gap-4 border-b border-zinc-900 pb-8"
          >
            <div className="flex flex-col gap-2">
              <div 
                className={cn(
                  "tracking-tighter text-zinc-50 whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  !isEditor && "text-[length:var(--g-fs-mob)] md:text-[length:var(--g-fs-tab)] lg:text-[length:var(--g-fs-desk)] leading-[var(--g-lh-mob)] md:leading-[var(--g-lh-tab)] lg:leading-[var(--g-lh-desk)] [font-family:var(--g-ff-mob)] md:[font-family:var(--ff-tab)] lg:[font-family:var(--g-ff-desk)] font-[var(--g-fw-mob)] md:font-[var(--g-fw-tab)] lg:font-[var(--g-fw-desk)]"
                )}
                style={{ 
                  fontSize: isEditor ? `${titleData.fontSize?.[globalPreviewMode || 'desktop'] || 48}px` : undefined,
                  lineHeight: isEditor ? (titleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                  fontFamily: isEditor ? (titleData.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                  fontWeight: isEditor ? (titleData.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                  "--g-fs-desk": `${titleData.fontSize?.desktop || 48}px`,
                  "--g-fs-tab": `${titleData.fontSize?.tablet || 40}px`,
                  "--g-fs-mob": `${titleData.fontSize?.mobile || 32}px`,
                  "--g-lh-desk": titleData.lineHeight?.desktop || '1.1',
                  "--g-lh-tab": titleData.lineHeight?.tablet || '1.1',
                  "--g-lh-mob": titleData.lineHeight?.mobile || '1.1',
                  "--g-ff-desk": titleData.fontFamily?.desktop || 'inherit',
                  "--g-ff-tab": titleData.fontFamily?.tablet || 'inherit',
                  "--g-ff-mob": titleData.fontFamily?.mobile || 'inherit',
                  "--g-fw-desk": titleData.fontWeight?.desktop || '700',
                  "--g-fw-tab": titleData.fontWeight?.tablet || '700',
                  "--g-fw-mob": titleData.fontWeight?.mobile || '700',
                } as any}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData.content, globalPreviewMode || 'desktop') || "" }} 
              />
              <div 
                className={cn(
                  "text-zinc-500 whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  !isEditor && "text-[length:var(--gs-fs-mob)] md:text-[length:var(--gs-fs-tab)] lg:text-[length:var(--gs-fs-desk)] leading-[var(--gs-lh-mob)] md:leading-[var(--gs-lh-tab)] lg:leading-[var(--gs-lh-desk)]"
                )}
                style={{ 
                  fontSize: isEditor ? `${subtitleData.fontSize?.[globalPreviewMode || 'desktop'] || 18}px` : undefined,
                  lineHeight: isEditor ? (subtitleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.5') : undefined,
                  "--gs-fs-desk": `${subtitleData.fontSize?.desktop || 18}px`,
                  "--gs-fs-tab": `${subtitleData.fontSize?.tablet || 16}px`,
                  "--gs-fs-mob": `${subtitleData.fontSize?.mobile || 14}px`,
                  "--gs-lh-desk": subtitleData.lineHeight?.desktop || '1.5',
                  "--gs-lh-tab": subtitleData.lineHeight?.tablet || '1.5',
                  "--gs-lh-mob": subtitleData.lineHeight?.mobile || '1.5',
                } as any}
                dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData.content, globalPreviewMode || 'desktop') || "" }} 
              />
            </div>

            {((showSeeAll && currentSeeAllPos === 'top') || (!showSeeAll)) && (
              <Link 
                href={showSeeAll ? (getResponsiveValue(seeAllLink, currentDevice) || "/projects") : "/projects"}
                className="hidden lg:flex group items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
              >
                {showSeeAll ? (getResponsiveValue(seeAllLabel, currentDevice) || "Xem tất cả") : "Xem tất cả"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
 
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                    isActive
                      ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                      : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
 
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
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
                className="group flex flex-col gap-3"
              >
                <Link href={`/project/${project.id}`} className="group flex flex-col gap-3">
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/50">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:brightness-75",
                        isAdmin && project.is_visible === false && "opacity-40 grayscale"
                      )}
                    />
                    {project.is_featured && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-orange-500 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-xl">
                        Nổi bật
                      </div>
                    )}
                    {isAdmin && project.is_visible === false && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/80 border border-zinc-700 rounded-full text-[10px] uppercase tracking-wider text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        Đang ẩn
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 border border-zinc-50 rounded-full text-xs font-medium text-zinc-50 backdrop-blur-sm bg-white/10">
                        {isAdmin && project.is_visible === false ? "Xem nháp" : "Xem ngay"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="px-1 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-zinc-50 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                      {project.tags.join(", ")}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {variant === 'subpage' && hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="group relative flex items-center gap-3 px-10 py-5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden w-full md:w-auto text-center justify-center shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-[0.2em] transition-colors relative z-10">
                  Xem thêm
                </span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-100 flex items-center justify-center transition-all duration-500 shrink-0">
                  <ArrowDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950" />
                </div>
              </button>
            </div>
          )}

          {variant === 'homepage' && ((showSeeAll && currentSeeAllPos === 'bottom') || (!showSeeAll)) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "mt-20 flex justify-center",
                !showSeeAll && "lg:hidden"
              )}
            >
              {showSeeAll ? (
                <Link 
                  href={getResponsiveValue(seeAllLink, currentDevice) || seeAllLink || "/projects"}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden w-full md:w-auto text-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
                    {getResponsiveValue(seeAllLabel, currentDevice) || seeAllLabel}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-100 flex items-center justify-center transition-all duration-500 group-hover:rotate-[-45deg] shrink-0">
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950" />
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/projects"
                  className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border border-zinc-800 px-6 py-3 rounded-full hover:border-zinc-500"
                >
                  Xem tất cả dự án
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          )}

          {filteredProjects.length === 0 && (
            <div className="w-full py-20 text-center text-zinc-500">
              No projects found for this category.
            </div>
          )}
        </div>
      </section>
    </SectionEditor>
  );
}
