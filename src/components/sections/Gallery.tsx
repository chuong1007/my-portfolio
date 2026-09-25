"use client";

import { cleanHtmlColors } from "@/lib/sanitize";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { getAllProjects } from "@/lib/data";
import { cn, generateSlug } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "@/components/SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "@/components/builder/RichTextEditor";
import { usePathname } from "next/navigation";

const normalize = (val: any): RichTextData => {
  const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
  const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
  const defaultFF = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };
  const defaultFW = { mobile: '400', tablet: '400', desktop: '400' };
  const defaultColor = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };
  
  if (typeof val === 'object' && val !== null && 'content' in val) {
    return {
      ...val,
      fontSize: val.fontSize || defaultFS,
      lineHeight: val.lineHeight || defaultLH,
      fontFamily: val.fontFamily || defaultFF,
      fontWeight: val.fontWeight || defaultFW,
      textColor: val.textColor || defaultColor
    };
  }
  return { 
    content: val || '', 
    fontSize: defaultFS,
    lineHeight: defaultLH,
    fontFamily: defaultFF,
    fontWeight: defaultFW,
    textColor: defaultColor
  };
};

const FALLBACK_CATEGORIES = ["All", "Poster", "Branding", "Logo Design", "UX/UI"];
const MOCK_PROJECTS = getAllProjects();

export function Gallery({ sectionId = "gallery", variant = 'homepage', initialContent, initialProjects }: any) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(() => initialContent?.isVisible ?? true);
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>(() => initialContent?.paddingTop ?? "0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>(() => initialContent?.paddingBottom ?? "128");
  const [dbProjects, setDbProjects] = useState<any[]>(() => initialProjects || []);
  const [loading, setLoading] = useState(initialProjects ? false : true);
  const [titleData, setTitleData] = useState<RichTextData>(() => initialContent?.title ? normalize(initialContent.title) : { content: "Dự án", fontSize: { desktop: 48, tablet: 40, mobile: 32 }, lineHeight: { desktop: "1.2", tablet: "1.2", mobile: "1.2" } });
  const [subtitleData, setSubtitleData] = useState<RichTextData>(() => initialContent?.subtitle ? normalize(initialContent.subtitle) : { content: "Các dự án thiết kế nổi bật", fontSize: { desktop: 18, tablet: 16, mobile: 14 }, lineHeight: { desktop: "1.5", tablet: "1.5", mobile: "1.5" } });
  const [columnsData, setColumnsData] = useState<ResponsiveValue>(() => initialContent?.columns ?? "3");
  const [dbCategories, setDbCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();

  // Framer motion scroll setup
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.1 });
  const x = useTransform(smoothProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  const fetchContent = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sectionData } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (sectionData?.data) {
        const d = sectionData.data as any;
        if (d.title !== undefined) setTitleData(normalize(d.title));
        if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.columns !== undefined) setColumnsData(d.columns);
      }

      const { data: projectsData } = await supabase
        .from('projects').select('*')
        .order('is_featured', { ascending: false })
        .order('featured_order', { ascending: true })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (projectsData) setDbProjects(projectsData);

      const { data: tagsData } = await supabase.from('project_tags').select('name').order('display_order', { ascending: true });
      if (tagsData && tagsData.length > 0) setDbCategories(["All", ...tagsData.map(t => t.name)]);
    } catch (e) {
      console.error("Gallery section error:", e);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._galleryRealtimeActive = true;
      if (d.title !== undefined) setTitleData(normalize(d.title));
      if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      if (d.columns !== undefined) setColumnsData(d.columns);
    };

    const handlePreviewUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.sectionId === sectionId) applyUpdate(customEvent.detail.data);
    };

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_UPDATE' && event.data.sectionId === sectionId) applyUpdate(event.data.data);
    };

    window.addEventListener('previewUpdate', handlePreviewUpdate);
    window.addEventListener('message', handleParentMessage);
    
    return () => {
      window.removeEventListener('previewUpdate', handlePreviewUpdate);
      window.removeEventListener('message', handleParentMessage);
    };
  }, [sectionId]);

  const projectsToDisplay = useMemo(() => {
    return dbProjects.length > 0 ? dbProjects.filter(p => isAdmin || p.is_visible) : MOCK_PROJECTS;
  }, [dbProjects, isAdmin]);

  const filteredProjects = useMemo(() => {
    const base = projectsToDisplay.map(p => ({ ...p, imageUrl: p.cover_image || p.imageUrl, tags: p.tags || [] }));
    if (activeCategory === "All") return base;
    return base.filter((p) => p.tags.includes(activeCategory));
  }, [activeCategory, projectsToDisplay]);

  useEffect(() => {
    const updateScrollRange = () => {
      if (trackRef.current) {
        const scrollWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        setScrollRange(Math.max(0, scrollWidth - viewportWidth));
      }
    };
    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    const timeoutId = setTimeout(updateScrollRange, 100);
    return () => { window.removeEventListener('resize', updateScrollRange); clearTimeout(timeoutId); };
  }, [filteredProjects, activeCategory, columnsData, globalPreviewMode]);

  if (!isVisible && !isAdmin) return null;

  const currentDevice = globalPreviewMode ?? 'desktop';
  const isEditor = isAdmin && isEditMode;

  const currentCols = parseInt(getResponsiveValue(columnsData, currentDevice)?.toString() || "3") || 3;
  const colsDesk = parseInt(getResponsiveValue(columnsData, 'desktop')?.toString() || "3") || 3;
  const colsTab = parseInt(getResponsiveValue(columnsData, 'tablet')?.toString() || "2") || 2;
  const colsMob = parseInt(getResponsiveValue(columnsData, 'mobile')?.toString() || "1") || 1;

  const initialData = { isVisible, paddingTop: paddingTopData, paddingBottom: paddingBottomData, title: titleData, subtitle: subtitleData, columns: columnsData };

  const pTop = getResponsiveValue(paddingTopData, isEditor ? globalPreviewMode : currentDevice);
  const pBottom = getResponsiveValue(paddingBottomData, isEditor ? globalPreviewMode : currentDevice);
  
  const sectionStyle = {
    marginTop: Number(pTop) < 0 ? `${pTop}px` : undefined,
    paddingTop: Number(pTop) >= 0 ? `${pTop}px` : undefined,
    marginBottom: Number(pBottom) < 0 ? `${pBottom}px` : undefined,
    paddingBottom: Number(pBottom) >= 0 ? `${pBottom}px` : undefined,
  };

  return (
    <SectionEditor 
      sectionId={sectionId} 
      initialData={initialData} 
      onSave={fetchContent} 
      isVisible={isVisible}
      extraActions={
        isAdmin && isEditMode ? (
          <Link href="/admin/projects" className="px-4 py-3 bg-[var(--bg-surface)]/80 backdrop-blur-md hover:bg-[var(--bg-elevated)] border border-[var(--border-default)]/50 rounded-full transition-all duration-300 shadow-xl group/admin-btn">
            <span className="text-[10px] font-bold text-[var(--text-muted)] group-hover/admin-btn:text-[var(--text-primary)] uppercase tracking-widest">Quản lý dự án</span>
          </Link>
        ) : null
      }
    >
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --card-w-mob: calc((100vw - 2rem - (${colsMob} - 1) * 1.5rem) / ${colsMob});
          --card-w-tab: calc((100vw - 6rem - (${colsTab} - 1) * 1.5rem) / ${colsTab});
          --card-w-desk: calc((min(100vw, 1280px) - 6rem - (${colsDesk} - 1) * 2rem) / ${colsDesk});
        }
        .gallery-card { width: var(--card-w-mob); }
        .gallery-track-pad { padding-left: calc(50vw - (var(--card-w-mob) / 2)); padding-right: calc(50vw - (var(--card-w-mob) / 2)); }
        
        @media (min-width: 768px) {
           .gallery-card { width: var(--card-w-tab); }
           .gallery-track-pad { padding-left: calc(50vw - (var(--card-w-tab) / 2)); padding-right: calc(50vw - (var(--card-w-tab) / 2)); }
        }
        @media (min-width: 1024px) {
           .gallery-card { width: var(--card-w-desk); }
           .gallery-track-pad { padding-left: calc(50vw - (var(--card-w-desk) / 2)); padding-right: calc(50vw - (var(--card-w-desk) / 2)); }
        }
      `}} />
      <section id="projects" className="bg-[var(--bg-base)] relative transition-all duration-700" style={sectionStyle}>
        <div ref={targetRef} className="relative md:h-[300vh]">
          
          <div 
            className="md:sticky max-md:relative md:h-screen flex flex-col justify-start max-md:overflow-visible overflow-hidden pt-[24px] pb-8"
            style={{ 
              top: 'var(--header-height, 0px)',
              transition: 'top 0.7s ease-out'
            }}
          >
            
            <div className="w-full shrink-0 max-w-7xl mx-auto mb-8 px-4 md:px-12">
              <div className="flex items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 mb-8">
                <div className="flex flex-col gap-2">
                  <h2 
                    className="tracking-tighter text-[var(--text-primary)] font-bold [&_p]:m-0 py-1"
                    style={{ fontSize: isEditor ? `${titleData.fontSize?.[currentDevice] || 48}px` : `${titleData.fontSize?.desktop || 48}px`, lineHeight: titleData.lineHeight?.[currentDevice] || '1.1', color: titleData.textColor?.[currentDevice] === 'inherit' ? undefined : titleData.textColor?.[currentDevice] }}
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(titleData.content, currentDevice) || "Dự án") }} 
                  />
                  <div 
                    className="text-[var(--text-muted)] [&_p]:m-0"
                    style={{ fontSize: isEditor ? `${subtitleData.fontSize?.[currentDevice] || 18}px` : `${subtitleData.fontSize?.desktop || 18}px`, lineHeight: subtitleData.lineHeight?.[currentDevice] || '1.5', color: subtitleData.textColor?.[currentDevice] === 'inherit' ? undefined : subtitleData.textColor?.[currentDevice] }}
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subtitleData.content, currentDevice) || "Các dự án thiết kế nổi bật") }} 
                  />
                </div>
                {!isEditor && (
                  <Link href="/projects" className="hidden lg:flex group items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold tracking-tight">
                    Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
              
              <div className="relative w-full">
                <div className="flex flex-nowrap items-center justify-start gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 pr-12">
                  {dbCategories.map((category) => (
                    <button key={category} onClick={() => setActiveCategory(category)} className={cn("shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border cursor-pointer", activeCategory === category ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]" : "bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-zinc-500 hover:text-[var(--text-secondary)]")}>
                      {category}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10" />
              </div>
            </div>

            <div className="w-full flex items-center flex-1">
              <motion.div 
                ref={trackRef}
                style={{ x }} 
                className="flex max-md:flex-col max-md:!transform-none max-md:w-full max-md:items-center max-md:px-4 max-md:!pl-4 max-md:!pr-4 md:items-start md:w-max py-4 gallery-track-pad gap-6 md:gap-8"
              >
                {loading && dbProjects.length === 0 ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="gallery-card flex flex-col gap-3 animate-pulse shrink-0 max-md:!w-full max-md:max-w-md">
                      <div className="relative w-full aspect-[4/5] rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
                    </div>
                  ))
                ) : (
                  filteredProjects.map((project, index) => (
                    <div key={project.id || index} className="gallery-card group flex flex-col gap-3 shrink-0 max-md:!w-full max-md:max-w-md">
                      <Link href={`/project/${project.slug || project.id}`} className="group flex flex-col gap-3 relative block">
                        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]/50 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                          <img src={project.imageUrl} alt={project.title} loading="lazy" referrerPolicy="no-referrer" className={cn("w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105", isAdmin && project.is_visible === false && "opacity-40 grayscale")} />
                          {project.is_featured && (
                            <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-transform group-hover:scale-110">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                            <span className="absolute bottom-6 left-6 flex items-center gap-2 px-5 py-2.5 border border-zinc-50/20 rounded-full text-sm font-semibold text-white backdrop-blur-md bg-white/10 shadow-xl transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                              Xem ngay <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                        <div className="px-2 flex flex-col mt-2">
                          <h3 className="text-[17px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-2 leading-[1.3] tracking-tight">{project.title}</h3>
                        </div>
                      </Link>
                      <div className="px-2 flex flex-wrap gap-x-2 gap-y-1">
                        {project.tags.map((tag: string, i: number) => (
                          <Link key={tag} href={`/tag/${generateSlug(tag)}`} className="text-sm font-medium text-[var(--text-muted)] hover:text-blue-400 transition-colors">
                            {tag}{i < project.tags.length - 1 ? "," : ""}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>
    </SectionEditor>
  );
}
