"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  tags: string[];
  is_featured: boolean;
};

export default function TagProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 min-h-[400px]">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
          className="group"
        >
          <Link href={`/project/${project.slug || project.id}`} className="flex flex-col gap-3">
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/50">
              <img
                src={project.cover_image}
                alt={project.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
              />
              
              {project.is_featured && (
                <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-transform group-hover:scale-110 z-10">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                </div>
              )}

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                <span className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 border border-zinc-50 rounded-full text-xs font-medium text-zinc-50 backdrop-blur-sm bg-white/10">
                  Xem ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            
            <div className="px-1">
              <h3 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-50 transition-colors leading-[1.6] tracking-wider line-clamp-2">
                {project.title}
              </h3>
            </div>
          </Link>
          <div className="px-1 flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1">
            {project.tags.map((tag: string, i: number) => (
              <Link 
                key={tag} 
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-sm text-zinc-500 hover:text-blue-400 transition-colors"
              >
                {tag}{i < project.tags.length - 1 ? "," : ""}
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
