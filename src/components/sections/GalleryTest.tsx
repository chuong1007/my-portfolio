"use client";

import { cleanHtmlColors } from "@/lib/sanitize";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { getAllProjects } from "@/lib/data";
import { cn, generateSlug } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getResponsiveValue } from "@/lib/responsive-helpers";

const FALLBACK_CATEGORIES = ["All", "Poster", "Branding", "Logo Design", "UX/UI"];
const MOCK_PROJECTS = getAllProjects();

export function GalleryTest({ sectionId = "gallery" }: { sectionId?: string }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [title, setTitle] = useState("Dự án");
  const [subtitle, setSubtitle] = useState("Các dự án thiết kế nổi bật");

  // Track ref for horizontal scroll
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.1 });
  const x = useTransform(smoothProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  const fetchContent = useCallback(async () => {
    try {
      const supabase = createClient();
      
      const { data: sectionData } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (sectionData?.data) {
        const d = sectionData.data as any;
        if (d.title?.content) setTitle(getResponsiveValue(d.title.content, 'desktop') || "Dự án");
        if (d.subtitle?.content) setSubtitle(getResponsiveValue(d.subtitle.content, 'desktop') || "Các dự án thiết kế nổi bật");
      }

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('featured_order', { ascending: true })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (projectsData) {
        setDbProjects(projectsData);
      }

      const { data: tagsData } = await supabase
        .from('project_tags')
        .select('name')
        .order('display_order', { ascending: true });
      
      if (tagsData && tagsData.length > 0) {
        setDbCategories(["All", ...tagsData.map(t => t.name)]);
      }
    } catch (e) {
      console.error("Gallery section error:", e);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const projectsToDisplay = useMemo(() => {
    return dbProjects.length > 0 
      ? dbProjects.filter(p => p.is_visible)
      : MOCK_PROJECTS;
  }, [dbProjects]);

  const filteredProjects = useMemo(() => {
    const base = projectsToDisplay.map(p => ({
      ...p,
      imageUrl: p.cover_image || p.imageUrl, 
      tags: p.tags || []
    }));

    if (activeCategory === "All") return base;
    return base.filter((p) => p.tags.includes(activeCategory));
  }, [activeCategory, projectsToDisplay]);

  // Update scroll range based on track width and window width
  useEffect(() => {
    const updateScrollRange = () => {
      if (trackRef.current) {
        const scrollWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Total distance to scroll is scrollWidth minus viewportWidth
        // If content is smaller than viewport, no scroll needed
        setScrollRange(Math.max(0, scrollWidth - viewportWidth));
      }
    };

    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    
    // Slight delay to ensure images/fonts loaded and width is correct
    const timeoutId = setTimeout(updateScrollRange, 100);
    return () => {
      window.removeEventListener('resize', updateScrollRange);
      clearTimeout(timeoutId);
    };
  }, [filteredProjects, activeCategory]); // Recalculate when items change

  return (
    <section id="projects-test" className="bg-[var(--bg-base)] pt-20">
      
      {/* Scrollable Container */}
      {/* 400vh gives enough scrolling time to comfortably view horizontally */}
      <div ref={targetRef} className="h-[300vh] relative">
        
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          
          {/* Header & Filters (Static vertically within the sticky, NOT scrolling horizontally) */}
          <div className="w-full shrink-0 max-w-7xl mx-auto px-4 md:px-12 mb-8">
            <div className="flex items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 mb-8">
              <div className="flex flex-col gap-2">
                <h2 
                  className="text-4xl md:text-5xl font-bold tracking-tighter text-[var(--text-primary)]"
                  dangerouslySetInnerHTML={{ __html: cleanHtmlColors(title) }} 
                />
                <div 
                  className="text-lg text-[var(--text-muted)]"
                  dangerouslySetInnerHTML={{ __html: cleanHtmlColors(subtitle) }} 
                />
              </div>
              <Link 
                href="/projects"
                className="hidden lg:flex group items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold tracking-tight"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-start gap-3">
              {dbCategories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border cursor-pointer",
                      isActive
                        ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]"
                        : "bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-zinc-500 hover:text-[var(--text-secondary)]"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Track */}
          {/* Padding Left is exactly 50vw - 200px (half card width) so 1st card centers on load.
              Padding Right is same so last card centers at end of scroll. */}
          <div className="flex-1 w-full flex items-center">
            <motion.div 
              ref={trackRef}
              style={{ x }} 
              className="flex gap-6 md:gap-8 items-start w-max px-[calc(50vw-160px)] md:px-[calc(50vw-200px)] py-4"
            >
              {loading && dbProjects.length === 0 ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse w-[320px] md:w-[400px] shrink-0">
                    <div className="relative w-full aspect-[4/5] rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
                    <div className="space-y-2">
                      <div className="h-4 bg-[var(--bg-surface)] rounded-md w-2/3" />
                      <div className="h-3 bg-[var(--bg-surface)] rounded-md w-full" />
                    </div>
                  </div>
                ))
              ) : (
                filteredProjects.map((project, index) => (
                  <div
                    key={project.id || index}
                    className="group flex flex-col gap-3 w-[320px] md:w-[400px] shrink-0"
                  >
                    <Link href={`/project/${project.slug || project.id}`} className="group flex flex-col gap-3 relative block">
                      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]/50 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {project.is_featured && (
                          <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-transform group-hover:scale-110">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          <span className="absolute bottom-6 left-6 flex items-center gap-2 px-5 py-2.5 border border-zinc-50/20 rounded-full text-sm font-semibold text-white backdrop-blur-md bg-white/10 shadow-xl transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                            Xem ngay
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="px-2 flex flex-col mt-2">
                        <h3 className="text-[17px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-2 leading-[1.3] tracking-tight">
                          {project.title}
                        </h3>
                      </div>
                    </Link>
                    <div className="px-2 flex flex-wrap gap-x-2 gap-y-1">
                      {project.tags.map((tag: string, i: number) => (
                        <Link 
                          key={tag} 
                          href={`/tag/${generateSlug(tag)}`}
                          className="text-sm font-medium text-[var(--text-muted)] hover:text-blue-400 transition-colors"
                        >
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
  );
}
