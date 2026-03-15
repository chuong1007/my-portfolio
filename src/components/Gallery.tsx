"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getAllProjects } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";

const CATEGORIES = ["All", "Poster", "Branding", "Logo Design", "UX/UI"];

// Không cần hardcode Aspect Ratio nữa vì sẽ dùng size thật của ảnh
// nhưng ta cứ giữ mảng này đề phòng cần dùng
const ASPECT_RATIOS = [
  "3/4",
  "4/3",
  "2/3",
  "1/1",
  "3/5",
  "5/4",
  "9/16",
  "4/5",
  "3/2",
  "5/7",
  "1/1",
  "7/5",
];

// Use cached projects from data layer
const MOCK_PROJECTS = getAllProjects();

type GalleryProps = {
  sectionId?: string;
};

export function Gallery({ sectionId = "gallery" }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(true);
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("128");
  const [itemsToShowData, setItemsToShowData] = useState<ResponsiveValue>(null);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [seeAllLabel, setSeeAllLabel] = useState("Xem tất cả dự án");
  const [seeAllLink, setSeeAllLink] = useState("/projects");
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();

  const fetchContent = async () => {
    // Prevent overwrite if realtime data is already active
    if ((window as any)._galleryRealtimeActive) return;

    try {
      const supabase = createClient();
      
      // Fetch Visibility & Padding Settings
      const { data: sectionData } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (sectionData?.data) {
        const d = sectionData.data as any;
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.itemsToShow !== undefined) setItemsToShowData(d.itemsToShow);
        if (d.showSeeAll !== undefined) setShowSeeAll(d.showSeeAll);
        if (d.seeAllLabel !== undefined) setSeeAllLabel(d.seeAllLabel);
        if (d.seeAllLink !== undefined) setSeeAllLink(d.seeAllLink);
      }

      // Fetch Real Projects
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
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Listen for real-time preview updates from AdminModal
  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._galleryRealtimeActive = true;
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

  const projectsToDisplay = dbProjects.length > 0 
    ? dbProjects.filter(p => isAdmin || p.is_visible) // In admin mode show all, public shows visible only
    : MOCK_PROJECTS;

  const filteredProjects = useMemo(() => {
    const base = projectsToDisplay.map(p => ({
      ...p,
      // Map database field names to what the UI expects
      imageUrl: p.cover_image || p.imageUrl, 
      tags: p.tags || []
    }));

    if (activeCategory === "All") return base;
    return base.filter((p) => p.tags.includes(activeCategory));
  }, [activeCategory, projectsToDisplay]);

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

  // Get items count based on responsive value or defaults
  const currentDevice = globalPreviewMode ?? 'desktop';
  const defaultCount = currentDevice === 'mobile' ? 4 : currentDevice === 'tablet' ? 6 : 16;
  const itemsToShow = parseInt(getResponsiveValue(itemsToShowData, currentDevice, defaultCount.toString()));

  const displayedProjects = filteredProjects.slice(0, itemsToShow);

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
            className="mb-12 flex items-end justify-between gap-4"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-50">Dự án</h2>
              <p className="text-zinc-500 text-lg">Các dự án thiết kế nổi bật</p>
            </div>

            {/* Desktop header See All */}
            {!showSeeAll && (
              <Link 
                href="/projects"
                className="hidden lg:flex group items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight"
              >
                Xem tất cả
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
 
          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {displayedProjects.map((project, index) => {
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "50px" }}
                  transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
                  className="break-inside-avoid mb-5"
                >
                  <Link
                    href={`/project/${project.id}`}
                    className="group flex flex-col gap-3"
                  >
                    {/* Image Container — removes forced aspectRatio so it flows naturally */}
                    <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/50 min-h-[200px]">
                      {/* Aspect Ratio block is handled by image dimensions normally, but we use natural h-auto */}
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={cn(
                          "w-full h-auto object-cover transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:brightness-75",
                          isAdmin && project.is_visible === false && "opacity-40 grayscale"
                        )}
                      />
 
                      {/* Hidden Indicator for Admin */}
                      {isAdmin && project.is_visible === false && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/80 border border-zinc-700 rounded-full text-[10px] uppercase tracking-wider text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          Đang ẩn
                        </div>
                      )}
 
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 border border-zinc-50 rounded-full text-xs font-medium text-zinc-50 backdrop-blur-sm bg-white/10">
                          {isAdmin && project.is_visible === false ? "Xem nháp" : "Xem ngay"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
 
                    {/* Project Meta */}
                    <div className="px-1">
                      <h3 className="text-lg font-bold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        {project.tags.join(", ")}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
 
          {/* See All Button / Fallback mobile link */}
          {(showSeeAll || !showSeeAll) && (
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
                    {seeAllLabel}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-100 flex items-center justify-center transition-all duration-500 group-hover:rotate-[-45deg]">
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

