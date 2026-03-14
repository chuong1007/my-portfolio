"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

type HeroProps = {
  sectionId?: string;
};

export function Hero({ sectionId = "hero" }: HeroProps) {
  const [title, setTitle] = useState("Visual Designer based in Ho Chi Minh City");
  const [subtitle, setSubtitle] = useState("Scroll to explore");
  const [isVisible, setIsVisible] = useState(true);
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('CHUONG.GRAPHIC');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const { isAdmin } = useAdmin();

  const fetchContent = async () => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", sectionId)
        .single();

      if (data?.data) {
        const d = data.data as any;
        if (d.title) setTitle(d.title);
        if (d.subtitle) setSubtitle(d.subtitle);
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.logoType) setLogoType(d.logoType);
        if (d.logoText) setLogoText(d.logoText);
        if (d.logoImageUrl) setLogoImageUrl(d.logoImageUrl);
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (!isVisible && !isAdmin) return null;

  return (
    <SectionEditor 
      sectionId={sectionId} 
      initialData={{ title, subtitle, logoType, logoText, logoImageUrl }} 
      onSave={fetchContent}
      isVisible={isVisible}
    >
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 text-center mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-50 leading-[1.1]"
        >
          {title}
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500"
        >
          <span className="text-xs uppercase tracking-widest">{subtitle}</span>
          <div className="w-[1px] h-12 bg-zinc-800 overflow-hidden relative">
            <motion.div
              className="absolute top-0 w-full h-full bg-zinc-400"
              initial={{ y: "-100%" }}
              animate={{ y: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      </section>
    </SectionEditor>
  );
}
