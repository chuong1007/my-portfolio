"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "./RichTextEditor";
const normalize = (val: any): RichTextData => {
  if (typeof val === 'object' && val !== null && 'content' in val) return val;
  return { 
    content: val || '', 
    fontSize: { mobile: 16, tablet: 18, desktop: 20 },
    lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5' },
    fontFamily: { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' },
    fontWeight: { mobile: '400', tablet: '400', desktop: '400' },
    textColor: { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' }
  };
};

const DEFAULTS = {
  heading: { 
    content: "About", 
    fontSize: { desktop: 30, tablet: 24, mobile: 18 },
    lineHeight: { desktop: '1.2', tablet: '1.2', mobile: '1.2' }
  },
  subheading: { 
    content: "Senior Graphic Designer | 7 Years of Experience", 
    fontSize: { desktop: 16, tablet: 14, mobile: 12 },
    lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' }
  },
  paragraphs: [
    { 
      content: "Chuyên gia thiết kế với hơn 7 năm đồng hành cùng nhiều thương hiệu trong và ngoài nước. Thế mạnh của tôi là xây dựng hình ảnh chuyên nghiệp, thẩm mỹ và có chiến lược.", 
      fontSize: { desktop: 18, tablet: 16, mobile: 14 },
      lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' }
    },
    { 
      content: "Luôn đặt hiệu quả truyền thông và sự hài lòng của khách hàng làm trọng tâm trong mọi dự án.", 
      fontSize: { desktop: 18, tablet: 16, mobile: 14 },
      lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' }
    },
  ],
};

type AboutProps = {
  sectionId?: string;
  initialContent?: any;
};

export function About({ sectionId = "about", initialContent }: AboutProps) {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";
  const [heading, setHeading] = useState<RichTextData>(() => initialContent?.heading ? normalize(initialContent.heading) : DEFAULTS.heading);
  const [subheading, setSubheading] = useState<RichTextData>(() => initialContent?.subheading ? normalize(initialContent.subheading) : DEFAULTS.subheading);
  const [paragraphs, setParagraphs] = useState<RichTextData[]>(() => {
    if (Array.isArray(initialContent?.paragraphs) && initialContent.paragraphs.length > 0) {
      return initialContent.paragraphs.map(normalize);
    }
    return DEFAULTS.paragraphs;
  });
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>(() => initialContent?.paddingTop ?? "0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>(() => initialContent?.paddingBottom ?? (isContactPage ? "0" : "128"));
  const [isVisible, setIsVisible] = useState(() => initialContent?.isVisible ?? true);
  const [loaded, setLoaded] = useState(true);
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();

  const fetchContent = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", sectionId)
        .single();

      if (data?.data) {
        const d = data.data as { 
          heading?: any; 
          subheading?: any; 
          paragraphs?: any[]; 
          isVisible?: boolean;
          paddingTop?: ResponsiveValue;
          paddingBottom?: ResponsiveValue;
        };
        if (d.heading !== undefined) setHeading(normalize(d.heading));
        if (d.subheading !== undefined) setSubheading(normalize(d.subheading));
        if (Array.isArray(d.paragraphs) && d.paragraphs.length > 0) {
          setParagraphs(d.paragraphs.map(p => normalize(p)));
        }
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
      }
    } catch {
      // Use defaults if table doesn't exist yet
    }
    setLoaded(true);
  }, [sectionId]);

  useEffect(() => {
    fetchContent();
  }, []);

  const applyUpdate = useCallback((d: any) => {
    if (d.heading !== undefined) setHeading(normalize(d.heading));
    if (d.subheading !== undefined) setSubheading(normalize(d.subheading));
    if (d.paragraphs !== undefined) setParagraphs(Array.isArray(d.paragraphs) ? d.paragraphs.map((p: any) => normalize(p)) : []);
    if (d.isVisible !== undefined) setIsVisible(d.isVisible);
    if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
    if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
  }, []);

  useEffect(() => {
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
  }, [sectionId, applyUpdate]);

  if (loaded && !isVisible && !isAdmin) return null;

  const contentData = { heading, subheading, paragraphs };
  const initialData = { 
    ...contentData, 
    isVisible, 
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData 
  };

        const isEditor = isAdmin && isEditMode;
        const currentPx = globalPreviewMode === 'mobile' ? '1rem' : '3rem';

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
          className={cn(
            "max-w-4xl mx-auto",
            !isEditor && "px-4 md:px-12"
          )}
          style={{
            paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`,
            paddingLeft: isEditor ? currentPx : undefined,
            paddingRight: isEditor ? currentPx : undefined
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
            <div 
              className="tracking-tighter text-zinc-50 text-balance whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0" 
              style={{ 
                fontSize: `${heading.fontSize?.[globalPreviewMode || 'desktop'] || 30}px`,
                lineHeight: heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1',
                fontFamily: heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit',
                fontWeight: heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700',
                color: heading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : heading.textColor?.[globalPreviewMode || 'desktop']
              }}
              dangerouslySetInnerHTML={{ __html: getResponsiveValue(heading.content, globalPreviewMode || 'desktop') }} 
            />
            <div 
              className="text-zinc-500 whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0" 
              style={{ 
                fontSize: `${getResponsiveValue(subheading.fontSize, globalPreviewMode || 'desktop') || 18}px`,
                lineHeight: getResponsiveValue(subheading.lineHeight, globalPreviewMode || 'desktop') || '1.5',
                fontFamily: subheading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit',
                fontWeight: subheading.fontWeight?.[globalPreviewMode || 'desktop'] || '400',
                color: subheading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : subheading.textColor?.[globalPreviewMode || 'desktop']
              }}
              dangerouslySetInnerHTML={{ __html: getResponsiveValue(subheading.content, globalPreviewMode || 'desktop') }} 
            />
            
            <div className="space-y-4 text-zinc-400 font-light">
              {paragraphs.map((p, i) => (
                <div 
                  key={i} 
                  style={{ 
                    fontSize: `${p.fontSize?.[globalPreviewMode || 'desktop'] || 18}px`,
                    lineHeight: p.lineHeight?.[globalPreviewMode || 'desktop'] || '1.6',
                    fontFamily: p.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit',
                    fontWeight: p.fontWeight?.[globalPreviewMode || 'desktop'] || '300',
                    color: p.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : p.textColor?.[globalPreviewMode || 'desktop']
                  }}
                  className="whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0"
                  dangerouslySetInnerHTML={{ __html: getResponsiveValue(p.content, globalPreviewMode || 'desktop') }} 
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </SectionEditor>
  );
}
