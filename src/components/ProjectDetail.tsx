"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/data";
import { createClient } from "@/lib/supabase";

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsAdmin(true);
    });
  }, []);

  // Only gallery images (no cover image duplication) + deduplicate by URL
  const allImages = useMemo(() => {
    const images = project.galleryImages || [];
    const seen = new Set<string>();
    return images.filter((img) => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
  }, [project]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % allImages.length);
  }, [lightboxIndex, allImages.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
  }, [lightboxIndex, allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, goNext, goPrev]);

  // Prevent right-click for non-admin users
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isAdmin) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full">
      {/* Sub Navigation */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 pt-28 pb-4">
        <Link
          href="/#dự-án"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Quay lại</span>
        </Link>

        {isAdmin && (
          <Link
            href={`/admin?edit=${project.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-zinc-300" />
            <span className="text-sm font-medium text-zinc-300">Chỉnh sửa</span>
          </Link>
        )}
      </div>

      {/* Project Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12"
      >
        {/* Project Info */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            {typeof project.title === 'string' ? project.title : String(project.title)}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-700 text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl [&_p]:mb-4 last:[&_p]:mb-0 [&_hr]:border-none [&_hr]:border-t [&_hr]:border-zinc-700 [&_hr]:my-6"
            dangerouslySetInnerHTML={{ 
              __html: typeof project.description === 'string' ? project.description : String(project.description) 
            }}
          />
        </div>
      </motion.section>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="border-t border-zinc-800" />
      </div>

      {/* Gallery Section - Pinterest Style Masonry */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-10 text-zinc-200"
        >
          Hình ảnh dự án
        </motion.h2>

        {/* Masonry Grid — full aspect ratio preserved */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {allImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
              className="break-inside-avoid mb-4 group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div
                className="relative w-full overflow-hidden rounded-xl bg-zinc-900"
                onContextMenu={handleContextMenu}
              >
                <img
                  src={image.url}
                  alt={project.title}
                  loading={index < 4 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  draggable={isAdmin}
                  className="w-full h-auto object-contain transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                  style={!isAdmin ? { pointerEvents: "none" } : undefined}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-6 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm font-medium">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {/* Navigation: Previous */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 md:left-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Navigation: Next */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 md:right-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative z-[1] max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={handleContextMenu}
            >
              <img
                src={allImages[lightboxIndex].url}
                alt={`${project.title} - ${lightboxIndex + 1}`}
                referrerPolicy="no-referrer"
                draggable={isAdmin}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                style={!isAdmin ? { pointerEvents: "none" } : undefined}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20 pt-8">
        <div className="border-t border-zinc-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-500 text-sm">
            © CHUONG.GRAPHIC
          </p>
          <Link
            href="/#dự-án"
            className="px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            ← Xem tất cả dự án
          </Link>
        </div>
      </div>
    </div>
  );
}
