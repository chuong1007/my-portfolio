"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

const DEFAULTS = {
  heading: "About",
  subheading: "Senior Graphic Designer | 7 Years of Experience",
  paragraphs: [
    "Chuyên gia thiết kế với hơn 7 năm đồng hành cùng nhiều thương hiệu trong và ngoài nước. Thế mạnh của tôi là xây dựng hình ảnh chuyên nghiệp, thẩm mỹ và có chiến lược.",
    "Luôn đặt hiệu quả truyền thông và sự hài lòng của khách hàng làm trọng tâm trong mọi dự án.",
  ],
};

type AboutProps = {
  sectionId?: string;
};

export function About({ sectionId = "about" }: AboutProps) {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";
  const [heading, setHeading] = useState(DEFAULTS.heading);
  const [subheading, setSubheading] = useState(DEFAULTS.subheading);
  const [paragraphs, setParagraphs] = useState<string[]>(DEFAULTS.paragraphs);
  const [isVisible, setIsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { isAdmin } = useAdmin();

  const fetchContent = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", sectionId)
        .single();

      if (data?.data) {
        const d = data.data as { heading?: string; subheading?: string; paragraphs?: string[]; isVisible?: boolean };
        if (d.heading && d.heading.trim()) setHeading(d.heading);
        if (d.subheading && d.subheading.trim()) setSubheading(d.subheading);
        if (d.paragraphs && d.paragraphs.length > 0 && d.paragraphs[0].trim()) {
          setParagraphs(d.paragraphs);
        }
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      }
    } catch {
      // Use defaults if table doesn't exist yet
    }
    setLoaded(true);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loaded && !isVisible && !isAdmin) return null;

  return (
    <SectionEditor
      sectionId={sectionId}
      initialData={{ heading, subheading, paragraphs }}
      onSave={fetchContent}
      isVisible={isVisible}
    >
      <section 
        id="about" 
        className={cn(
          "px-6 md:px-12 bg-zinc-950",
          isContactPage ? "pt-32 pb-20" : "py-32"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
            style={{ opacity: loaded ? undefined : 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-50">
              {heading}
            </h2>

            <h3 className="text-xl md:text-2xl font-bold text-zinc-300">
              {subheading}
            </h3>
            
            <div className="space-y-6 text-xl md:text-3xl leading-relaxed text-zinc-400 font-light whitespace-pre-wrap">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </SectionEditor>
  );
}
