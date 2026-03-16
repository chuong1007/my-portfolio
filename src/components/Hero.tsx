"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "./RichTextEditor";
const normalize = (val: any): RichTextData => {
  const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
  const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
  
  if (typeof val === 'object' && val !== null && 'content' in val) {
    return {
      ...val,
      fontSize: val.fontSize || defaultFS,
      lineHeight: val.lineHeight || defaultLH
    };
  }
  return { 
    content: val || '', 
    fontSize: defaultFS,
    lineHeight: defaultLH
  };
};

type HeroProps = {
  sectionId?: string;
};

export function Hero({ sectionId = "hero" }: HeroProps) {
  const [titleData, setTitleData] = useState<RichTextData>({ 
    content: "Visual Designer based in Ho Chi Minh City", 
    fontSize: { desktop: 80, tablet: 60, mobile: 32 },
    lineHeight: { desktop: '1.1', tablet: '1.1', mobile: '1.1' }
  });
  const [subtitleData, setSubtitleData] = useState<RichTextData>({ content: "Scroll to explore", fontSize: { desktop: 10, tablet: 10, mobile: 10 }, lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5' } });
  const [scrollOffset, setScrollOffset] = useState<ResponsiveValue>("48");
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("0");
  const [isVisible, setIsVisible] = useState(true);
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('CHUONG.GRAPHIC');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [logoColor, setLogoColor] = useState('#FFFFFF');
  const { isAdmin, globalPreviewMode } = useAdmin();

  const fetchContent = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", sectionId)
        .single();
 
      if (data?.data) {
        const d = data.data as any;
        if (d.title !== undefined) setTitleData(normalize(d.title));
        if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        
        // Preserve responsive objects if they exist
        if (d.logoType) setLogoType(d.logoType);
        if (d.logoText) setLogoText(d.logoText);
        if (d.logoColor) setLogoColor(d.logoColor);
        if (d.logoImageUrl) setLogoImageUrl(d.logoImageUrl);
        
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.scrollOffset !== undefined) setScrollOffset(d.scrollOffset);
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchContent();
  }, []);

  // Listen for real-time preview updates from AdminModal
  const applyUpdate = useCallback((d: any) => {
    console.log("Hero receiving live update:", d);
    if (d.isVisible !== undefined) setIsVisible(d.isVisible);
    if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
    if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
    if (d.title !== undefined) setTitleData(normalize(d.title));
    if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
    if (d.scrollOffset !== undefined) setScrollOffset(d.scrollOffset);
    if (d.logoText !== undefined) setLogoText(d.logoText);
    if (d.logoImageUrl !== undefined) setLogoImageUrl(d.logoImageUrl);
    if (d.logoColor !== undefined) setLogoColor(d.logoColor);
    if (d.logoType !== undefined) setLogoType(d.logoType);
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

  if (!isVisible && !isAdmin) return null;

  // Get values for each breakpoint (with fallback chain)
  const desktopTitle = getResponsiveValue(titleData, 'desktop');
  const tabletTitle = getResponsiveValue(titleData, 'tablet');
  const mobileTitle = getResponsiveValue(titleData, 'mobile');
  
  const desktopSubtitle = getResponsiveValue(subtitleData, 'desktop');
  const tabletSubtitle = getResponsiveValue(subtitleData, 'tablet');
  const mobileSubtitle = getResponsiveValue(subtitleData, 'mobile');

  // Build initialData for SectionEditor using raw responsive data
  const initialData = { 
    isVisible, 
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData,
    title: titleData,
    subtitle: subtitleData,
    scrollOffset: scrollOffset,
    logoType,
    logoText,
    logoColor,
    logoImageUrl
  };

// Helper to add px if it's just a number
const formatFs = (val: string, fallback: string) => {
  if (!val) return fallback;
  if (/^\d+$/.test(val.trim())) return `${val}px`;
  return val;
};

  return (
    <SectionEditor 
      sectionId={sectionId} 
      initialData={initialData} 
      onSave={fetchContent}
      isVisible={isVisible}
      controlsOffset="top-32"
    >
      <section 
        className="relative flex flex-col items-center px-6 text-center min-h-[90vh]"
        style={{
          paddingTop: `${parseInt(getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || '0')}px`,
          paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 0}px`
        }}
      >
        <div className="flex-1 flex flex-col items-center w-full">
            <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-bold tracking-tighter text-zinc-50 text-balance mx-auto whitespace-pre-wrap sm:text-[length:var(--fs-tab)] lg:text-[length:var(--fs-desk)]"
            style={{
              "--fs-desk": `${titleData.fontSize?.desktop || 80}px`,
              "--fs-tab": `${titleData.fontSize?.tablet || 60}px`,
              "--fs-mob": `${titleData.fontSize?.mobile || 32}px`,
              "--lh-desk": titleData.lineHeight?.desktop || '1.1',
              "--lh-tab": titleData.lineHeight?.tablet || '1.1',
              "--lh-mob": titleData.lineHeight?.mobile || '1.1',
              fontSize: globalPreviewMode === 'mobile' ? 'var(--fs-mob)' : globalPreviewMode === 'tablet' ? 'var(--fs-tab)' : 'var(--fs-desk)',
              lineHeight: globalPreviewMode === 'mobile' ? 'var(--lh-mob)' : globalPreviewMode === 'tablet' ? 'var(--lh-tab)' : 'var(--lh-desk)'
            } as React.CSSProperties}
          >
            {/* Desktop variant */}
            <div className="hidden lg:block w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData.content, 'desktop') }} />
            {/* Tablet variant */}
            <div className="hidden md:block lg:hidden w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData.content, 'tablet') }} />
            {/* Mobile variant */}
            <div className="block md:hidden w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" dangerouslySetInnerHTML={{ __html: getResponsiveValue(titleData.content, 'mobile') }} />
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col items-center gap-2 text-zinc-500"
          style={{
            marginTop: `${getResponsiveValue(scrollOffset, globalPreviewMode) || 48}px`,
            "--fs-sub-desk": `${subtitleData.fontSize?.desktop || 10}px`,
            "--fs-sub-tab": `${subtitleData.fontSize?.tablet || 10}px`,
            "--fs-sub-mob": `${subtitleData.fontSize?.mobile || 10}px`,
            "--lh-sub-desk": subtitleData.lineHeight?.desktop || '1.5',
            "--lh-sub-tab": subtitleData.lineHeight?.tablet || '1.5',
            "--lh-sub-mob": subtitleData.lineHeight?.mobile || '1.5',
          } as React.CSSProperties}
        >
          {/* Subtitle with responsive variants */}
          <div 
            className="uppercase tracking-[0.2em] font-medium hidden lg:block whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" 
            style={{ fontSize: "var(--fs-sub-desk)", lineHeight: "var(--lh-sub-desk)" }}
            dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData.content, 'desktop') }} 
          />
          <div 
            className="uppercase tracking-[0.2em] font-medium hidden md:block lg:hidden whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" 
            style={{ fontSize: "var(--fs-sub-tab)", lineHeight: "var(--lh-sub-tab)" }}
            dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData.content, 'tablet') }} 
          />
          <div 
            className="uppercase tracking-[0.2em] font-medium block md:hidden whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]" 
            style={{ fontSize: "var(--fs-sub-mob)", lineHeight: "var(--lh-sub-mob)" }}
            dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitleData.content, 'mobile') }} 
          />
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
