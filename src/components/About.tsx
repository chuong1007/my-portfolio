"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";

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
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>(isContactPage ? "80" : "128");
  const [isVisible, setIsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { isAdmin, globalPreviewMode } = useAdmin();

  const fetchContent = async () => {
    // Prevent overwrite if realtime data is already active
    if ((window as any)._aboutRealtimeActive) return;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", sectionId)
        .single();

      if (data?.data) {
        const d = data.data as { 
          heading?: string; 
          subheading?: string; 
          paragraphs?: string[]; 
          isVisible?: boolean;
          paddingTop?: ResponsiveValue;
          paddingBottom?: ResponsiveValue;
        };
        if (d.heading) {
          if (typeof d.heading === 'string' && d.heading.trim()) setHeading(d.heading);
          else if (typeof d.heading === 'object') setHeading(getResponsiveValue(d.heading, 'desktop'));
        }
        if (d.subheading) {
          if (typeof d.subheading === 'string' && d.subheading.trim()) setSubheading(d.subheading);
          else if (typeof d.subheading === 'object') setSubheading(getResponsiveValue(d.subheading, 'desktop'));
        }
        if (Array.isArray(d.paragraphs) && d.paragraphs.length > 0) {
          setParagraphs(d.paragraphs.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)));
        }
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
      }
    } catch {
      // Use defaults if table doesn't exist yet
    }
    setLoaded(true);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Listen for real-time preview updates from AdminModal
  useEffect(() => {
    const applyUpdate = (d: any) => {
      (window as any)._aboutRealtimeActive = true;
      if (d.heading !== undefined) setHeading(typeof d.heading === 'object' ? getResponsiveValue(d.heading, globalPreviewMode ?? 'desktop') : d.heading);
      if (d.subheading !== undefined) setSubheading(typeof d.subheading === 'object' ? getResponsiveValue(d.subheading, globalPreviewMode ?? 'desktop') : d.subheading);
      if (d.paragraphs !== undefined) setParagraphs(Array.isArray(d.paragraphs) ? d.paragraphs.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)) : d.paragraphs);
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
      if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
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

  if (loaded && !isVisible && !isAdmin) return null;

  const contentData = { heading, subheading, paragraphs };
  const initialData = { 
    ...contentData, 
    isVisible, 
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData 
  };

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section 
        id="about" 
        className="relative bg-zinc-950"
        style={{
          paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 0}px`
        }}
      >
        <div 
          className="max-w-4xl mx-auto px-6 md:px-12"
          style={{
            paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
            style={{ opacity: loaded ? undefined : 1 }}
          >
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold tracking-tighter text-zinc-50 text-balance" dangerouslySetInnerHTML={{ __html: typeof heading === 'string' ? getResponsiveValue(heading, globalPreviewMode ?? 'desktop') : String(heading) }} />
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-zinc-400 text-balance" dangerouslySetInnerHTML={{ __html: typeof subheading === 'string' ? getResponsiveValue(subheading, globalPreviewMode ?? 'desktop') : String(subheading) }} />
            
            <div className="space-y-4 text-sm sm:text-base md:text-lg leading-relaxed text-zinc-400 font-light whitespace-pre-wrap">
              {paragraphs.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: typeof p === 'string' ? p : JSON.stringify(p) }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </SectionEditor>
  );
}
