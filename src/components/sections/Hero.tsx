"use client";

import { cleanHtmlColors } from "@/lib/sanitize";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "@/components/SectionEditor";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";
import { HeroIntroCarousel } from "./HeroIntroCarousel";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";
import { getAllProjects } from "@/lib/data";



const getSafeColor = (color?: string | null) => {
  if (!color || color === 'inherit') return undefined;
  const upper = color.toUpperCase();
  if (upper === '#FFFFFF' || upper === '#FFF' || upper === 'RGB(255, 255, 255)') {
    return 'var(--text-primary)';
  }
  return color;
};
const normalize = (val: any): RichTextData => {
  const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
  const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
  const defaultFF = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };
  const defaultFW = { mobile: '400', tablet: '400', desktop: '400' };
  const defaultColor = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };

  // Fill missing keys in a responsive object — fallback to desktop value if mobile/tablet missing
  const fillKeys = (obj: any, def: any) => {
    if (!obj || typeof obj !== 'object') return def;
    const desk = obj.desktop ?? def.desktop;
    return {
      desktop: desk,
      tablet: obj.tablet ?? desk,
      mobile: obj.mobile ?? obj.tablet ?? desk,
    };
  };
  
  if (typeof val === 'object' && val !== null && 'content' in val) {
    return {
      ...val,
      fontSize: fillKeys(val.fontSize, defaultFS),
      lineHeight: fillKeys(val.lineHeight, defaultLH),
      fontFamily: fillKeys(val.fontFamily, defaultFF),
      fontWeight: fillKeys(val.fontWeight, defaultFW),
      textColor: fillKeys(val.textColor, defaultColor),
      letterSpacing: fillKeys(val.letterSpacing, { mobile: '0', tablet: '0', desktop: '0' }),
    };
  }
  return { 
    content: val || '', 
    fontSize: defaultFS,
    lineHeight: defaultLH,
    fontFamily: defaultFF,
    fontWeight: defaultFW,
    textColor: defaultColor
  };
};

type HeroProps = {
  sectionId?: string;
  initialContent?: any;
  initialProjects?: any[];
  customCarouselImages?: any[];
  tiltDirection?: "inward" | "outward" | "inward-reverse-scale";
  carouselGap?: number;
  carouselPerspective?: number;
  dTheta?: number;
  w_card?: number;
  blurStrength?: number;
  dimStrength?: number;
  displayCount?: number;
  yOffsetMobile?: number;
  yOffsetTablet?: number;
  yOffsetDesktop?: number;
};

export function Hero({ sectionId = "hero", initialContent, initialProjects, customCarouselImages, tiltDirection = "inward", carouselGap, carouselPerspective, dTheta, w_card, blurStrength, dimStrength, displayCount, yOffsetMobile = 48, yOffsetTablet = 112, yOffsetDesktop = 152 }: HeroProps) {
  const [titleData, setTitleData] = useState<RichTextData>(() => initialContent?.title ? normalize(initialContent.title) : { 
    content: "Visual Designer based in Ho Chi Minh City", 
    fontSize: { desktop: 80, tablet: 60, mobile: 32 },
    lineHeight: { desktop: '1.1', tablet: '1.1', mobile: '1.1' }
  });
  const [subtitleData, setSubtitleData] = useState<RichTextData>(() => initialContent?.subtitle ? normalize(initialContent.subtitle) : { content: "Scroll to explore", fontSize: { desktop: 10, tablet: 10, mobile: 10 }, lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5' } });
  const [locationData, setLocationData] = useState<RichTextData>(() => initialContent?.location ? normalize(initialContent.location) : { content: "based in Ho Chi Minh City", fontSize: { desktop: 80, tablet: 60, mobile: 32 }, lineHeight: { desktop: '1.1', tablet: '1.1', mobile: '1.1' } });
  const [scrollOffset, setScrollOffset] = useState<ResponsiveValue>(() => initialContent?.scrollOffset ?? "48");
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>(() => initialContent?.paddingTop ?? "0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>(() => initialContent?.paddingBottom ?? "0");
  const [scrollPadding, setScrollPadding] = useState<ResponsiveValue>(() => initialContent?.scrollPadding ?? initialContent?.paddingTopTextScroll ?? "0");
  const [subTextPadding, setSubTextPadding] = useState<ResponsiveValue>(() => initialContent?.subTextPadding ?? "0");
  const [isVisible, setIsVisible] = useState(() => initialContent?.isVisible ?? true);
  const [logoType, setLogoType] = useState<'text' | 'image'>(() => initialContent?.logoType ?? 'text');
  const [logoText, setLogoText] = useState(() => initialContent?.logoText ?? 'CHUONG.GRAPHIC');
  const [logoImageUrl, setLogoImageUrl] = useState(() => initialContent?.logoImageUrl ?? '');
  const [logoColor, setLogoColor] = useState(() => initialContent?.logoColor ?? '#FFFFFF');
  const [logoHeight, setLogoHeight] = useState<ResponsiveValue>(() => initialContent?.logoHeight ?? "40");
    
  const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();
  const isEditor = isAdmin && isEditMode;
  
  let finalProjects = [];
  if (customCarouselImages && customCarouselImages.length > 0) {
    finalProjects = customCarouselImages.map(img => ({
      id: img.id,
      title: "Hero Project",
      imageUrl: img.url
    }));
  } else {
    finalProjects = (initialProjects && initialProjects.length > 0) ? initialProjects : getAllProjects();
  }

  const [showCarousel, setShowCarousel] = useState(finalProjects.length > 0);

  let carouselDelay = 3.0; // 0.6s wait + 8*0.25s slide + 0.8s fade // 0.8s wait + 8*0.25s slide + 0.8s fade
  if (showCarousel && finalProjects.length > 0) {
    const numCards = Math.min(finalProjects.length, 8);
    carouselDelay = 3.0; // 0.6s wait + 8*0.25s slide + 0.8s fade // 0.8s wait + 8*0.25s slide + 0.8s fade // Added 0.8s for background to fade before text appears
  }

  console.log("Hero render - showCarousel:", showCarousel, "initialProjects:", initialProjects?.length, "isEditor:", isEditor);
  const heroRef = useRef<HTMLElement>(null);
  const [scrollVisible, setScrollVisible] = useState(false);
  const handleCarouselComplete = useCallback(() => {}, []);

  // Track actual browser width for public mode (guests)
  const [actualDeviceMode, setActualDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setActualDeviceMode(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // The device mode to use for styling: admin uses globalPreviewMode, public uses actual width
  const effectiveMode = isAdmin ? (globalPreviewMode || 'desktop') : actualDeviceMode;

  useEffect(() => {
    const handleFinished = () => {
      setTimeout(() => setScrollVisible(true), 1350);
      window.dispatchEvent(new Event("introFinished"));
    };
    const handleStart = () => {
      setScrollVisible(false);
    };
    window.addEventListener('typographyFinished', handleFinished);
    window.addEventListener('typographyStarted', handleStart);
    const fallback = setTimeout(() => { setScrollVisible(true); window.dispatchEvent(new Event("introFinished")); }, 12000);
    return () => {
      window.removeEventListener('typographyFinished', handleFinished);
      window.removeEventListener('typographyStarted', handleStart);
      clearTimeout(fallback);
    };
  }, []);

  // Also reset when data changes (for editor)
  useEffect(() => {
    setScrollVisible(false);
  }, [titleData.content, locationData.content]);
  
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scrollFilter = useTransform(scrollYProgress, [0, 0.1, 0.5], ["blur(0px)", "blur(0px)", "blur(12px)"]);

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
        if (d.location !== undefined) setLocationData(normalize(d.location));
    if (d.subTextPadding !== undefined) setSubTextPadding(d.subTextPadding);
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        
        // Preserve responsive objects if they exist
        if (d.logoType) setLogoType(d.logoType);
        if (d.logoText) setLogoText(d.logoText);
        if (d.logoColor) setLogoColor(d.logoColor);
        if (d.logoImageUrl) setLogoImageUrl(d.logoImageUrl);
        if (d.logoHeight) setLogoHeight(d.logoHeight);
        
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.scrollPadding !== undefined) setScrollPadding(d.scrollPadding);
        else if (d.paddingTopTextScroll !== undefined) setScrollPadding(d.paddingTopTextScroll); // Migration
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
    if (d.scrollPadding !== undefined) setScrollPadding(d.scrollPadding);
    else if (d.paddingTopTextScroll !== undefined) setScrollPadding(d.paddingTopTextScroll);
    if (d.title !== undefined) setTitleData(normalize(d.title));
    if (d.subtitle !== undefined) setSubtitleData(normalize(d.subtitle));
    if (d.location !== undefined) setLocationData(normalize(d.location));
    if (d.subTextPadding !== undefined) setSubTextPadding(d.subTextPadding);
    if (d.scrollOffset !== undefined) setScrollOffset(d.scrollOffset);
    if (d.logoText !== undefined) setLogoText(d.logoText);
    if (d.logoImageUrl !== undefined) setLogoImageUrl(d.logoImageUrl);
    if (d.logoColor !== undefined) setLogoColor(d.logoColor);
    if (d.logoType !== undefined) setLogoType(d.logoType);
    if (d.logoHeight !== undefined) setLogoHeight(d.logoHeight);
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
    location: locationData,
    subTextPadding,
    scrollOffset: scrollOffset,
    scrollPadding: scrollPadding,
    logoType,
    logoText,
    logoColor,
    logoImageUrl,
    logoHeight,
  };

// Helper to add px if it's just a number
const formatFs = (val: string, fallback: string) => {
  if (!val) return fallback;
  if (/^\d+$/.test(val.trim())) return `${val}px`;
  return val;
};


  // Parity 1:1 current values for Editor mode
  const ptOffset = 80;
  const currentPt = (parseInt(String(getResponsiveValue(paddingTopData, effectiveMode) || '0'))) + ptOffset;
  const currentPb = getResponsiveValue(paddingBottomData, effectiveMode);
  const currentFs = titleData.fontSize?.[effectiveMode] || 40;
  const currentScroll = getResponsiveValue(scrollPadding, effectiveMode) ?? getResponsiveValue(scrollOffset, effectiveMode) ?? 0;

  return (
    <SectionEditor 
      sectionId={sectionId} 
      initialData={initialData} 
      onSave={fetchContent}
      isVisible={isVisible}
      controlsOffset="top-32"
    >
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-container:not(.is-editor) {
          padding-top: var(--pad-mob);
          margin-bottom: var(--pb-mob);
        }
        .hero-title:not(.is-editor) .hero-location {
          font-size: var(--fs-loc-mob);
          line-height: var(--lh-loc-mob);
          letter-spacing: var(--ls-loc-mob);
          font-family: var(--ff-loc-mob);
          font-weight: var(--fw-loc-mob);
          color: var(--color-loc-mob, inherit);
        }
        @media (min-width: 768px) {
          .hero-title:not(.is-editor) .hero-location {
            font-size: var(--fs-loc-tab);
            line-height: var(--lh-loc-tab);
            letter-spacing: var(--ls-loc-tab);
            font-family: var(--ff-loc-tab);
            font-weight: var(--fw-loc-tab);
            color: var(--color-loc-tab, inherit);
          }
        }
        @media (min-width: 1024px) {
          .hero-title:not(.is-editor) .hero-location {
            font-size: var(--fs-loc-desk);
            line-height: var(--lh-loc-desk);
            letter-spacing: var(--ls-loc-desk);
            font-family: var(--ff-loc-desk);
            font-weight: var(--fw-loc-desk);
            color: var(--color-loc-desk, inherit);
          }
        }
        .hero-title-inner:not(.is-editor) {
          font-size: var(--fs-mob);
          line-height: var(--lh-mob);
          letter-spacing: var(--ls-mob);
          font-family: var(--ff-mob);
          font-weight: var(--fw-mob);
          color: var(--color-mob, inherit);
        }
        .hero-subtitle:not(.is-editor) {
          font-size: var(--fs-sub-mob);
          line-height: var(--lh-sub-mob);
          font-family: var(--ff-sub-mob);
          font-weight: var(--fw-sub-mob);
          color: var(--color-sub-mob, inherit);
        }
        .hero-scroll:not(.is-editor) {
          margin-top: var(--scroll-mob);
        }

        @media (min-width: 768px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-tab);
            margin-bottom: var(--pb-tab);
          }
          .hero-title-inner:not(.is-editor) {
            font-size: var(--fs-tab);
            line-height: var(--lh-tab);
            letter-spacing: var(--ls-tab);
            font-family: var(--ff-tab);
            font-weight: var(--fw-tab);
            color: var(--color-tab, inherit);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-tab);
            line-height: var(--lh-sub-tab);
            font-family: var(--ff-sub-tab);
            font-weight: var(--fw-sub-tab);
            color: var(--color-sub-tab, inherit);
          }
          .hero-scroll:not(.is-editor) {
            margin-top: var(--scroll-tab);
          }
        }

        @media (min-width: 1024px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-desk);
            margin-bottom: var(--pb-desk);
          }
          .hero-title-inner:not(.is-editor) {
            font-size: var(--fs-desk);
            line-height: var(--lh-desk);
            letter-spacing: var(--ls-desk);
            font-family: var(--ff-desk);
            font-weight: var(--fw-desk);
            color: var(--color-desk, inherit);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-desk);
            line-height: var(--lh-sub-desk);
            font-family: var(--ff-sub-desk);
            font-weight: var(--fw-sub-desk);
            color: var(--color-sub-desk, inherit);
          }
          .hero-scroll:not(.is-editor) {
            margin-top: var(--scroll-desk);
          }
        }
      `}} />

      <section ref={heroRef}
        className={cn(
          "hero-container relative flex flex-col items-center justify-start px-4 text-center min-h-[90vh] overflow-x-hidden",
          !isEditor && "not-is-editor",
          isEditor && "is-editor"
        )}
        style={{
          paddingTop: `${currentPt}px`,
          marginBottom: currentPb ? `${currentPb}px` : undefined,
          "--pad-desk": `calc(${ptOffset}px + ${getResponsiveValue(paddingTopData, 'desktop') || 0}px)`,
          "--pad-tab": `calc(${ptOffset}px + ${getResponsiveValue(paddingTopData, 'tablet') || 0}px)`,
          "--pad-mob": `calc(${ptOffset}px + ${getResponsiveValue(paddingTopData, 'mobile') || 0}px)`,
          "--pb-desk": `${getResponsiveValue(paddingBottomData, 'desktop') || 0}px`,
          "--pb-tab": `${getResponsiveValue(paddingBottomData, 'tablet') || 0}px`,
          "--pb-mob": `${getResponsiveValue(paddingBottomData, 'mobile') || 0}px`
        } as React.CSSProperties}
      >
        {/* 3D Intro Carousel */}
        {showCarousel && (
          <HeroIntroCarousel isAdminPreview={false} deviceMode={effectiveMode} 
            projects={finalProjects}
            tiltDirection={tiltDirection} 
            gap={carouselGap}
            perspectiveMultiplier={carouselPerspective}
            dTheta={dTheta}
            w_card={w_card}
            blurStrength={blurStrength}
            dimStrength={dimStrength}
            displayCount={displayCount}
            yOffsetMobile={yOffsetMobile}
            yOffsetTablet={yOffsetTablet}
            yOffsetDesktop={yOffsetDesktop}
            onComplete={handleCarouselComplete} 
          />
        )}

        <motion.div className="flex flex-col items-center w-full" >
            <motion.div className="flex flex-col items-center w-full" style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}>
            <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: carouselDelay }}
            className={cn("hero-title", !isEditor && "not-is-editor", isEditor && "is-editor",
              "tracking-tighter text-[var(--text-primary)] text-balance mx-auto whitespace-pre-wrap transition-all duration-300"
            )}
            style={{
              fontSize: effectiveMode === 'mobile' 
                ? `clamp(20px, ${(titleData.fontSize?.[effectiveMode] || 40) / 4}vw, ${titleData.fontSize?.[effectiveMode] || 40}px)`
                : effectiveMode === 'tablet'
                ? `clamp(30px, ${(titleData.fontSize?.[effectiveMode] || 60) / 8}vw, ${titleData.fontSize?.[effectiveMode] || 60}px)`
                : `${titleData.fontSize?.[effectiveMode] || 80}px`,
              "--fs-desk": `${titleData.fontSize?.desktop || 80}px`,
              "--fs-tab": `${titleData.fontSize?.tablet || 60}px`,
              "--fs-mob": `${titleData.fontSize?.mobile || 40}px`,
              "--lh-desk": titleData.lineHeight?.desktop || '1.1',
              "--lh-tab": titleData.lineHeight?.tablet || '1.1',
              "--lh-mob": titleData.lineHeight?.mobile || '1.1',
              "--ls-desk": `${titleData.letterSpacing?.desktop || '0'}px`,
              "--ls-tab": `${titleData.letterSpacing?.tablet || '0'}px`,
              "--ls-mob": `${titleData.letterSpacing?.mobile || '0'}px`,
              "--ff-desk": titleData.fontFamily?.desktop || 'Syne, sans-serif',
              "--ff-tab": titleData.fontFamily?.tablet || 'Syne, sans-serif',
              "--ff-mob": titleData.fontFamily?.mobile || 'Syne, sans-serif',
              "--fw-desk": titleData.fontWeight?.desktop || '700',
              "--fw-tab": titleData.fontWeight?.tablet || '700',
              "--fw-mob": titleData.fontWeight?.mobile || '700',
              "--fs-loc-desk": `${locationData.fontSize?.desktop || 80}px`,
              "--fs-loc-tab": `${locationData.fontSize?.tablet || 60}px`,
              "--fs-loc-mob": `${locationData.fontSize?.mobile || 32}px`,
              "--lh-loc-desk": locationData.lineHeight?.desktop || '1.1',
              "--lh-loc-tab": locationData.lineHeight?.tablet || '1.1',
              "--lh-loc-mob": locationData.lineHeight?.mobile || '1.1',
              "--ls-loc-desk": `${locationData.letterSpacing?.desktop || '0'}px`,
              "--ls-loc-tab": `${locationData.letterSpacing?.tablet || '0'}px`,
              "--ls-loc-mob": `${locationData.letterSpacing?.mobile || '0'}px`,
              "--ff-loc-desk": locationData.fontFamily?.desktop || 'Syne, sans-serif',
              "--ff-loc-tab": locationData.fontFamily?.tablet || 'Syne, sans-serif',
              "--ff-loc-mob": locationData.fontFamily?.mobile || 'Syne, sans-serif',
              "--fw-loc-desk": locationData.fontWeight?.desktop || '300',
              "--fw-loc-tab": locationData.fontWeight?.tablet || '300',
              "--fw-loc-mob": locationData.fontWeight?.mobile || '300',
              "--color-loc-desk": getSafeColor(locationData.textColor?.desktop) === 'inherit' ? undefined : getSafeColor(locationData.textColor?.desktop),
              "--color-loc-tab": getSafeColor(locationData.textColor?.tablet) === 'inherit' ? undefined : getSafeColor(locationData.textColor?.tablet),
              "--color-loc-mob": getSafeColor(locationData.textColor?.mobile) === 'inherit' ? undefined : getSafeColor(locationData.textColor?.mobile),
              "--color-desk": getSafeColor(titleData.textColor?.desktop) === 'inherit' ? undefined : getSafeColor(titleData.textColor?.desktop),
              "--color-tab": getSafeColor(titleData.textColor?.tablet) === 'inherit' ? undefined : getSafeColor(titleData.textColor?.tablet),
              "--color-mob": getSafeColor(titleData.textColor?.mobile) === 'inherit' ? undefined : getSafeColor(titleData.textColor?.mobile),
            } as any}
          >
            {/* Using arbitrary values with CSS variables for responsive styling */}
            <HeroAnimatedTitle startDelay={carouselDelay}
              className={cn("hero-title-inner", !isEditor && "not-is-editor", isEditor && "is-editor",
                "w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]"
              )}
              style={{
                lineHeight: titleData.lineHeight?.[effectiveMode] || '1.1',
                fontFamily: titleData.fontFamily?.[effectiveMode] || 'Syne, sans-serif',
                fontWeight: titleData.fontWeight?.[effectiveMode] || '700',
                color: titleData.textColor?.[effectiveMode] === 'inherit' ? undefined : titleData.textColor?.[effectiveMode],
              }}
              html={cleanHtmlColors(getResponsiveValue(titleData.content, effectiveMode) || "")}
              locationHtml={cleanHtmlColors(getResponsiveValue(locationData.content, effectiveMode) || "")}
              locationStyle={{
                fontSize: `${locationData.fontSize?.[effectiveMode] || 32}px`,
                lineHeight: locationData.lineHeight?.[effectiveMode] || '1.1',
                letterSpacing: `${locationData.letterSpacing?.[effectiveMode] || '0'}px`,
                fontFamily: locationData.fontFamily?.[effectiveMode] || 'Syne, sans-serif',
                fontWeight: locationData.fontWeight?.[effectiveMode] || '300',
                paddingTop: `${getResponsiveValue(subTextPadding, effectiveMode) || '0'}px`,
                color: locationData.textColor?.[effectiveMode] === 'inherit' ? undefined : locationData.textColor?.[effectiveMode],
              }}
            />
          </motion.h1>
        </motion.div>
        </motion.div>
        
        <motion.div >
        <motion.div style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}>
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: scrollVisible ? 1 : 0 }}
  transition={{ duration: 1 }}
  className={cn("hero-scroll", !isEditor && "not-is-editor", isEditor && "is-editor",
    "flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer hover:opacity-80 transition-opacity"
  )}
  onClick={() => {
    const about = document.getElementById('about');
    if (about) about.scrollIntoView({ behavior: 'smooth' });
  }}
  style={{
    marginTop: isEditor ? `${currentScroll}px` : undefined,
    "--scroll-desk": `${getResponsiveValue(scrollPadding, 'desktop') ?? getResponsiveValue(scrollOffset, 'desktop') ?? 0}px`,
    "--scroll-tab": `${getResponsiveValue(scrollPadding, 'tablet') ?? getResponsiveValue(scrollOffset, 'tablet') ?? 0}px`,
    "--scroll-mob": `${getResponsiveValue(scrollPadding, 'mobile') ?? getResponsiveValue(scrollOffset, 'mobile') ?? 0}px`,
    "--fs-sub-desk": `${subtitleData.fontSize?.desktop || 10}px`,
    "--fs-sub-tab": `${subtitleData.fontSize?.tablet || 10}px`,
    "--fs-sub-mob": `${subtitleData.fontSize?.mobile || 10}px`,
    "--lh-sub-desk": subtitleData.lineHeight?.desktop || '1.5',
    "--lh-sub-tab": subtitleData.lineHeight?.tablet || '1.5',
    "--lh-sub-mob": subtitleData.lineHeight?.mobile || '1.5',
    "--ff-sub-desk": subtitleData.fontFamily?.desktop || 'inherit',
    "--ff-sub-tab": subtitleData.fontFamily?.tablet || 'inherit',
    "--ff-sub-mob": subtitleData.fontFamily?.mobile || 'inherit',
    "--fw-sub-desk": subtitleData.fontWeight?.desktop || '500',
    "--fw-sub-tab": subtitleData.fontWeight?.tablet || '500',
    "--fw-sub-mob": subtitleData.fontWeight?.mobile || '500',
    "--color-sub-desk": getSafeColor(subtitleData.textColor?.desktop) === 'inherit' ? undefined : getSafeColor(subtitleData.textColor?.desktop),
    "--color-sub-tab": getSafeColor(subtitleData.textColor?.tablet) === 'inherit' ? undefined : getSafeColor(subtitleData.textColor?.tablet),
    "--color-sub-mob": getSafeColor(subtitleData.textColor?.mobile) === 'inherit' ? undefined : getSafeColor(subtitleData.textColor?.mobile),
  } as React.CSSProperties}
>
  {/* Subtitle with responsive variants */}
  <div 
    className={cn("hero-subtitle", !isEditor && "not-is-editor", isEditor && "is-editor",
      "uppercase tracking-[0.2em] whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] transition-all duration-300"
    )}
    style={{
      fontSize: `${subtitleData.fontSize?.[effectiveMode] || 10}px`,
      lineHeight: subtitleData.lineHeight?.[effectiveMode] || '1.5',
      fontFamily: subtitleData.fontFamily?.[effectiveMode] || 'inherit',
      fontWeight: subtitleData.fontWeight?.[effectiveMode] || '500',
      color: subtitleData.textColor?.[effectiveMode] === 'inherit' ? undefined : subtitleData.textColor?.[effectiveMode],
    }}
    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subtitleData.content, effectiveMode) || "") }} 
  />
  <div className="w-[1px] h-12 bg-[var(--border-default)] overflow-hidden relative">
    <motion.div
      className="absolute top-0 w-full h-full bg-[var(--text-muted)]"
      initial={{ y: "-100%" }}
      animate={{ y: "100%" }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  </div>
</motion.div>
        </motion.div>
        </motion.div>
      </section>
    </SectionEditor>
  );
}
