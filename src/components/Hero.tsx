"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";

type HeroProps = {
  sectionId?: string;
};

export function Hero({ sectionId = "hero" }: HeroProps) {
  const [titleData, setTitleData] = useState<ResponsiveValue>("Visual Designer based in Ho Chi Minh City");
  const [subtitleData, setSubtitleData] = useState<ResponsiveValue>("Scroll to explore");
  const [titleMaxWidthData, setTitleMaxWidthData] = useState<ResponsiveValue>("100");
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("0");
  const [titleFontSizeData, setTitleFontSizeData] = useState<ResponsiveValue>("desktop: 8xl, tablet: 6xl, mobile: 3xl");
  const [subtitleFontSizeData, setSubtitleFontSizeData] = useState<ResponsiveValue>("10");
  const [isVisible, setIsVisible] = useState(true);
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('CHUONG.GRAPHIC');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [logoColor, setLogoColor] = useState('#FFFFFF');
  const { isAdmin, globalPreviewMode } = useAdmin();

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
        // Keep raw data (could be string or responsive object)
        if (d.title !== undefined) setTitleData(d.title);
        if (d.subtitle !== undefined) setSubtitleData(d.subtitle);
        if (d.titleMaxWidth !== undefined) setTitleMaxWidthData(d.titleMaxWidth);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.titleFontSize !== undefined) setTitleFontSizeData(d.titleFontSize);
        if (d.subtitleFontSize !== undefined) setSubtitleFontSizeData(d.subtitleFontSize);
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.logoType) setLogoType(d.logoType);
        if (d.logoText) setLogoText(typeof d.logoText === 'object' ? getResponsiveValue(d.logoText, 'desktop') : d.logoText);
        if (d.logoColor) setLogoColor(typeof d.logoColor === 'object' ? getResponsiveValue(d.logoColor, 'desktop') : d.logoColor);
        if (d.logoImageUrl) setLogoImageUrl(typeof d.logoImageUrl === 'object' ? getResponsiveValue(d.logoImageUrl, 'desktop') : d.logoImageUrl);
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Listen for real-time preview updates from AdminModal
  useEffect(() => {
    const applyUpdate = (d: any) => {
      // Mark that we are receiving realtime data to prevent fetchContent from overwriting
      (window as any)._heroRealtimeLoaded = true;
      
      if (d.title !== undefined) setTitleData(d.title);
      if (d.subtitle !== undefined) setSubtitleData(d.subtitle);
      if (d.titleMaxWidth !== undefined) setTitleMaxWidthData(d.titleMaxWidth);
      if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
      if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
      if (d.titleFontSize !== undefined) setTitleFontSizeData(d.titleFontSize);
      if (d.subtitleFontSize !== undefined) setSubtitleFontSizeData(d.subtitleFontSize);
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      if (d.logoType) setLogoType(d.logoType);
      if (d.logoText) setLogoText(typeof d.logoText === 'object' ? getResponsiveValue(d.logoText, 'desktop') : d.logoText);
      if (d.logoColor) setLogoColor(typeof d.logoColor === 'object' ? getResponsiveValue(d.logoColor, 'desktop') : d.logoColor);
      if (d.logoImageUrl) setLogoImageUrl(typeof d.logoImageUrl === 'object' ? getResponsiveValue(d.logoImageUrl, 'desktop') : d.logoImageUrl);
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
    titleFontSize: titleFontSizeData,
    subtitle: subtitleData,
    subtitleFontSize: subtitleFontSizeData,
    titleMaxWidth: titleMaxWidthData,
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
    >
      <section 
        className="relative flex flex-col items-center px-6 text-center min-h-[70vh]"
        style={{
          paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 0}px`
        }}
      >
        <div 
          className="flex-1 flex flex-col items-center justify-start w-full"
          style={{
            paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-bold tracking-tighter text-zinc-50 leading-[1.1] text-balance mx-auto whitespace-pre-line sm:text-[length:var(--fs-tab)] lg:text-[length:var(--fs-desk)]"
            style={{
              "--mw-desk": `${getResponsiveValue(titleMaxWidthData, 'desktop') ?? 100}%`,
              "--mw-tab": `${getResponsiveValue(titleMaxWidthData, 'tablet') ?? 100}%`,
              "--mw-mob": `${getResponsiveValue(titleMaxWidthData, 'mobile') ?? 100}%`,
              "--fs-desk": formatFs(getResponsiveValue(titleFontSizeData, 'desktop'), '8rem'),
              "--fs-tab": formatFs(getResponsiveValue(titleFontSizeData, 'tablet'), '3.75rem'),
              "--fs-mob": formatFs(getResponsiveValue(titleFontSizeData, 'mobile'), '1.875rem'),
              maxWidth: "var(--mw-mob)",
              fontSize: globalPreviewMode === 'mobile' ? 'var(--fs-mob)' : globalPreviewMode === 'tablet' ? 'var(--fs-tab)' : 'var(--fs-desk)'
            } as React.CSSProperties}
          >
            {/* Desktop variant */}
            <span className="hidden lg:inline-block w-full whitespace-pre-line" style={{ maxWidth: 'var(--mw-desk)' }} dangerouslySetInnerHTML={{ __html: typeof desktopTitle === 'string' ? desktopTitle : String(desktopTitle) }} />
            {/* Tablet variant */}
            <span className="hidden md:inline-block lg:hidden w-full whitespace-pre-line" style={{ maxWidth: 'var(--mw-tab)' }} dangerouslySetInnerHTML={{ __html: typeof tabletTitle === 'string' ? tabletTitle : String(tabletTitle) }} />
            {/* Mobile variant */}
            <span className="inline-block md:hidden w-full whitespace-pre-line" style={{ maxWidth: 'var(--mw-mob)' }} dangerouslySetInnerHTML={{ __html: typeof mobileTitle === 'string' ? mobileTitle : String(mobileTitle) }} />
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 mb-10 flex flex-col items-center gap-2 text-zinc-500"
          style={{
            "--fs-sub-desk": formatFs(getResponsiveValue(subtitleFontSizeData, 'desktop'), '10px'),
            "--fs-sub-tab": formatFs(getResponsiveValue(subtitleFontSizeData, 'tablet'), '10px'),
            "--fs-sub-mob": formatFs(getResponsiveValue(subtitleFontSizeData, 'mobile'), '10px'),
          } as React.CSSProperties}
        >
          {/* Subtitle with responsive variants */}
          <span 
            className="uppercase tracking-[0.2em] font-medium hidden lg:inline whitespace-pre-line" 
            style={{ fontSize: "var(--fs-sub-desk)" }}
            dangerouslySetInnerHTML={{ __html: typeof desktopSubtitle === 'string' ? desktopSubtitle : String(desktopSubtitle) }} 
          />
          <span 
            className="uppercase tracking-[0.2em] font-medium hidden md:inline lg:hidden whitespace-pre-line" 
            style={{ fontSize: "var(--fs-sub-tab)" }}
            dangerouslySetInnerHTML={{ __html: typeof tabletSubtitle === 'string' ? tabletSubtitle : String(tabletSubtitle) }} 
          />
          <span 
            className="uppercase tracking-[0.2em] font-medium inline md:hidden whitespace-pre-line" 
            style={{ fontSize: "var(--fs-sub-mob)" }}
            dangerouslySetInnerHTML={{ __html: typeof mobileSubtitle === 'string' ? mobileSubtitle : String(mobileSubtitle) }} 
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
