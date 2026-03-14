"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  slug: string;
};

export function PortfolioGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) return (
    <div className="px-6 md:px-12 py-24 grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[4/3] bg-zinc-900 animate-pulse rounded-3xl" />
      ))}
    </div>
  );

  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex justify-between items-end mb-16">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Selected Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-50 mt-2 tracking-tighter">Case Studies</h2>
        </div>
        <Link href="/projects" className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <span className="text-sm font-medium uppercase tracking-wider">All Projects</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
          >
            <Link href={`/project/${project.slug}`} className="group block space-y-6">
              <div className="aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800/50">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-50 group-hover:text-zinc-400 transition-colors uppercase tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-zinc-500 font-medium tracking-wide mt-1 uppercase text-xs">
                    {project.category}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
