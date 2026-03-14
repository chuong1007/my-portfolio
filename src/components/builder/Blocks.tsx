"use client";

import { motion } from "framer-motion";
import { Gallery } from "../Gallery";
import { Blog } from "../Blog";
import { cn } from "@/lib/utils";

type BlockProps = {
  data: any;
};

export function TextBlock({ data }: BlockProps) {
  return (
    <div className="space-y-4 py-4">
      {data.title && (
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-zinc-50">
          {data.title}
        </h2>
      )}
      {data.content && (
        <div className="text-lg md:text-2xl text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">
          {data.content}
        </div>
      )}
    </div>
  );
}

export function ImageBlock({ data }: BlockProps) {
  if (!data.url) return (
    <div className="aspect-video bg-zinc-900 flex items-center justify-center border border-dashed border-zinc-800 rounded-3xl">
      <span className="text-zinc-600 uppercase tracking-widest text-xs">Chưa có ảnh</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl group"
    >
      <img 
        src={data.url} 
        alt={data.alt || "Builder Image"} 
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </motion.div>
  );
}

export function ProjectBlock({ data }: BlockProps) {
  return (
    <div className="py-4">
      {data.title && <h3 className="text-xl font-bold text-zinc-500 mb-8 uppercase tracking-widest">{data.title}</h3>}
      <Gallery sectionId={data.customId || "gallery-block"} />
    </div>
  );
}

export function BlogBlock({ data }: BlockProps) {
  return (
    <div className="py-4">
      {data.title && <h3 className="text-xl font-bold text-zinc-500 mb-8 uppercase tracking-widest">{data.title}</h3>}
      <Blog variant="homepage" sectionId={data.customId || "blog-block"} />
    </div>
  );
}
