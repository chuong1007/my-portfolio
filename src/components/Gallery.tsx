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
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const { isAdmin } = useAdmin();

  const fetchContent = async () => {
    try {
      const supabase = createClient();
      
      // Fetch Visibility Settings
      const { data: sectionData } = await supabase.from('site_content').select('data').eq('id', sectionId).single();
      if (sectionData?.data) {
        const d = sectionData.data as { isVisible?: boolean };
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
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
      console.error("Gallery content error:", e);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

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

  return (
    <SectionEditor 
      sectionId={sectionId} 
      initialData={{ isVisible }} 
      onSave={fetchContent} 
      isVisible={isVisible}
      extraActions={
        isAdmin && (
          <Link
            href="/admin?tab=projects"
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Quản lý dự án
          </Link>
        )
      }
    >
      <section id="dự-án" className="py-24 px-6 md:px-12 min-h-screen">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex flex-col gap-2"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-50">Dự án</h2>
        <p className="text-zinc-500 text-lg">Các dự án thiết kế nổi bật</p>
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
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        {filteredProjects.map((project, index) => {
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

      {filteredProjects.length === 0 && (
        <div className="w-full py-20 text-center text-zinc-500">
          No projects found for this category.
        </div>
      )}
      </section>
    </SectionEditor>
  );
}

