"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pencil, ImageIcon } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/data";
import { createClient } from "@/lib/supabase";
type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsAdmin(true);
    });
  }, []);

  // Combine cover image + gallery images so cover is first
  const allImages = useMemo(() => {
    const coverImage = {
      id: `cover-${project.id}`,
      url: project.imageUrl,
      aspectRatio: project.aspectRatio,
    };
    return [coverImage, ...project.galleryImages];
  }, [project]);

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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl"
          >
            {typeof project.description === 'string' ? project.description : String(project.description)}
          </motion.p>
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

        {/* Masonry Grid — cover image + all gallery images */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {allImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
              className="break-inside-avoid mb-4 group"
            >
              <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900 min-h-[200px]">
                <img
                  src={image.url}
                  alt={project.title}
                  loading={index < 4 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
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

