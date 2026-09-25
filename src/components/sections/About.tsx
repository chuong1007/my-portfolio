"use client";

import { cleanHtmlColors } from "@/lib/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "@/components/SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { ChevronDown, ArrowRight, Pencil } from "lucide-react";
import { generateSlug } from "@/lib/utils";

function stripMentionClasses(html: string): string {
  if (!html) return "";
  return html.replace(
    /<span\b([^>]*?)data-type="mention"([^>]*?)class="([^"]*)"/gi,
    '<span$1data-type="mention"$2class="mention"'
  ).replace(
    /<span\b([^>]*?)class="([^"]*?)"([^>]*?)data-type="mention"/gi,
    '<span$1class="mention"$3data-type="mention"'
  );
}

import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "@/components/builder/RichTextEditor";

const getSafeColor = (color?: string | null) => {
  if (!color || color === 'inherit') return undefined;
  const upper = color.toUpperCase();
  if (upper === '#FFFFFF' || upper === '#FFF' || upper === 'RGB(255, 255, 255)') {
    return 'var(--text-primary)';
  }
  return color;
};

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
    }
  ],
};

type ExpandedBlock = {
  id: string;
  type: 'full' | 'half';
  title?: string;
  content: string;
};

type AboutProps = {
  sectionId?: string;
  initialContent?: any;
};

export function About({ sectionId = "about", initialContent }: AboutProps) {
  const router = useRouter();
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

  const [avatarUrl, setAvatarUrl] = useState<string>(initialContent?.avatarUrl ?? "");
  const [expandedBlocks, setExpandedBlocks] = useState<ExpandedBlock[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(true);
  const expandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && expandRef.current && isAnimationComplete) {
      setTimeout(() => {
        const firstBlock = expandRef.current!.querySelector('.w-full.flex.flex-col');
        if (firstBlock) {
          (window as any).__isSnapScrolling = true;
          const targetY = firstBlock.getBoundingClientRect().top + window.scrollY;
          const header = document.querySelector('header');
          const headerHeight = header ? header.getBoundingClientRect().height : 72;
          
          // If we are already scrolled down (> 100px), header is hidden so effective height is 0
          const effectiveHeaderHeight = (window.scrollY > 100) ? 0 : headerHeight;
          
          // Snap so the content is 80px below the effective top
          window.scrollTo({ top: targetY - effectiveHeaderHeight - 80, behavior: 'smooth' });

          setTimeout(() => {
            (window as any).__isSnapScrolling = false;
          }, 1000);
        } else {
          // Fallback
          const y = expandRef.current!.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: y + 49, behavior: 'smooth' });
        }
      }, 50); 
    }
  }, [isExpanded, isAnimationComplete]);

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
        const d = data.data as any;
        if (d.heading !== undefined) setHeading(normalize(d.heading));
        if (d.subheading !== undefined) setSubheading(normalize(d.subheading));
        if (Array.isArray(d.paragraphs) && d.paragraphs.length > 0) {
          setParagraphs(d.paragraphs.map((p: any) => normalize(p)));
        }
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.avatarUrl !== undefined) setAvatarUrl(d.avatarUrl);
        if (d.expandedBlocks !== undefined) {
          // Xử lý migrate tự động title cho nội dung cũ nếu chưa có title
          const parsedBlocks = d.expandedBlocks.map((b: any) => {
            if (b.title !== undefined) return b; // Đã có cấu trúc mới
            const match = b.content.match(/<p><strong>(.*?)<\/strong><\/p>([\s\S]*)/);
            if (match) {
              return { ...b, title: match[1].replace(/^\d+\.\s*/, ''), content: match[2] };
            }
            return { ...b, title: "Untitled", content: b.content };
          });
          setExpandedBlocks(parsedBlocks);
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [sectionId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const applyUpdate = useCallback((d: any) => {
    if (d.heading !== undefined) setHeading(normalize(d.heading));
    if (d.subheading !== undefined) setSubheading(normalize(d.subheading));
    if (d.paragraphs !== undefined) setParagraphs(Array.isArray(d.paragraphs) ? d.paragraphs.map((p: any) => normalize(p)) : []);
    if (d.isVisible !== undefined) setIsVisible(d.isVisible);
    if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
    if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
    if (d.avatarUrl !== undefined) setAvatarUrl(d.avatarUrl);
    if (d.expandedBlocks !== undefined) setExpandedBlocks(d.expandedBlocks);
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

  useEffect(() => {
    const isInsideIframe = window !== window.parent;
    const handleTagClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mention = target.closest('.mention, [data-type="mention"]') as HTMLElement;
      if (!mention) return;
      if (isInsideIframe && isEditMode) return;

      e.preventDefault();
      e.stopPropagation();

      const tag = mention.getAttribute('data-id') ||
        mention.getAttribute('data-label') ||
        mention.innerText;
      if (tag) {
        const cleanTag = tag.replace(/^#/, '').trim();
        const url = `/tag/${generateSlug(cleanTag)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handleTagClick, true);
    return () => document.removeEventListener('click', handleTagClick, true);
  }, [isEditMode]);

  if (loaded && !isVisible && !isAdmin) return null;

  const contentData = { heading, subheading, paragraphs };
  const initialData = {
    ...contentData,
    isVisible,
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData,
    avatarUrl,
    expandedBlocks
  };

  const isEditor = isAdmin && isEditMode;
  const currentPx = globalPreviewMode === 'mobile' ? '1rem' : '3rem';

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section id="about"
        className={cn("relative bg-[var(--bg-base)] transition-all duration-700", !isEditor && "not-is-editor", isEditor && "is-editor")}
        style={{
          paddingTop: isEditor ? (Number(getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0) >= 0 ? `${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px` : '0px') : `${getResponsiveValue(paddingTopData, 'desktop')}px`,
          paddingBottom: isEditor ? (Number(getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)) >= 0 ? `${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)}px` : '0px') : `${getResponsiveValue(paddingBottomData, 'desktop')}px`,
        } as React.CSSProperties}
      >
        <div
          className={cn("max-w-7xl mx-auto", !isEditor && "px-4 md:px-12", isEditor && "is-editor",
            isEditor && globalPreviewMode === 'mobile' && "px-4",
            isEditor && globalPreviewMode === 'tablet' && "px-8",
            isEditor && globalPreviewMode === 'desktop' && "px-12"
          )}
          style={{
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
            {/* Top Section */}
            <div className="mx-auto space-y-8">
              <div className={cn("flex flex-col gap-8 md:gap-16 items-start", !isAdmin ? "md:flex-row" : (globalPreviewMode !== 'desktop' ? "flex-col" : "flex-row"))}>
                
                {/* CỘT TRÁI */}
                <div className={cn("w-full flex flex-col gap-6", !isAdmin ? "md:w-5/12" : (globalPreviewMode !== 'desktop' ? "w-full" : "w-5/12"))}>
                  {avatarUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="shrink-0"
                    >
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className={cn(
                          "object-cover transition-all duration-300",
                          !(avatarUrl.startsWith('data:image/svg') || avatarUrl.includes('avatar-emoji.svg')) && "rounded-full border-2 border-[var(--border-default)] shadow-xl",
                          !isAdmin ? "w-16 h-16 md:w-20 md:h-20" : (globalPreviewMode !== 'desktop' ? "w-16 h-16" : "w-20 h-20")
                        )}
                      />
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <div
                      className="tracking-tighter text-[var(--text-primary)] text-balance font-bold [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit"
                      style={{
                        fontSize: isEditor ? `${heading.fontSize?.[globalPreviewMode || 'desktop'] || 30}px` : `${heading.fontSize?.desktop || 32}px`,
                        lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : '1.2',
                        fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : 'inherit',
                        color: heading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : heading.textColor?.[globalPreviewMode || 'desktop']
                      } as React.CSSProperties}
                      dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(heading.content, globalPreviewMode || 'desktop')) }}
                    />
                    <div
                      className="text-[var(--text-muted)] whitespace-pre-wrap font-medium [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0"
                      style={{
                        fontSize: isEditor ? `${getResponsiveValue(subheading.fontSize, globalPreviewMode || 'desktop') || 16}px` : `${subheading.fontSize?.desktop || 20}px`,
                        lineHeight: isEditor ? (getResponsiveValue(subheading.lineHeight, globalPreviewMode || 'desktop') || '1.4') : '1.4',
                        fontFamily: isEditor ? (subheading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : 'inherit',
                        color: subheading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : subheading.textColor?.[globalPreviewMode || 'desktop']
                      } as React.CSSProperties}
                      dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subheading.content, globalPreviewMode || 'desktop')) }}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI */}
                <div className={cn("w-full flex flex-col space-y-6", !isAdmin ? "md:w-7/12 md:mt-[148px]" : (globalPreviewMode !== 'desktop' ? "w-full mt-6" : "w-7/12 mt-[148px]"))}>
                  <div className="space-y-4 text-[var(--text-muted)]">
                    {paragraphs.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: isEditor ? `${p.fontSize?.[globalPreviewMode || 'desktop'] || 16}px` : `${p.fontSize?.desktop || 18}px`,
                          lineHeight: isEditor ? (p.lineHeight?.[globalPreviewMode || 'desktop'] || '1.6') : '1.6',
                          fontFamily: isEditor ? (p.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : 'inherit',
                          color: p.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : p.textColor?.[globalPreviewMode || 'desktop']
                        } as React.CSSProperties}
                        className="text-justify [text-wrap:pretty] [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit"
                        dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(p.content, globalPreviewMode || 'desktop')) }}
                      />
                    ))}
                  </div>

                  {expandedBlocks.length > 0 && (
                    <div className="pt-2 flex flex-col items-start bg-transparent">
                      <button
                        onClick={() => {
                          (window as any).__isSnapScrolling = true;
                          setIsExpanded(!isExpanded);
                          setIsAnimationComplete(false);
                          setTimeout(() => {
                            (window as any).__isSnapScrolling = false;
                          }, 2500);
                        }}
                        className={cn(
                          "group flex items-center gap-2 text-sm font-medium px-6 py-2 rounded-full transition-all duration-300 border",
                          isExpanded
                            ? "text-[var(--text-muted)] border-[var(--border-default)]/60 hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
                            : "text-blue-400 border-blue-500/40 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                        )}
                      >
                        <span>{isExpanded ? "Rút gọn" : "Xem chi tiết"}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Detail Content */}
            {/* Expanded Detail Content */}
            {expandedBlocks.length > 0 && (
              <motion.div
                ref={expandRef}
                initial={{ height: 180 }}
                animate={{ height: isExpanded ? "auto" : 180 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setIsAnimationComplete(true)}
                className={cn(
                  "relative",
                  isExpanded && isAnimationComplete ? "overflow-visible" : "overflow-hidden"
                )}
              >
                  <div className={cn(
                    "border-t border-[var(--border-subtle)] flex flex-col transition-all duration-700",
                    isExpanded ? "mt-12 pt-24" : "mt-6 pt-6"
                  )}>
                    {expandedBlocks.map((block, index) => {
                      let cleanContent = stripMentionClasses(block.content);
                      cleanContent = cleanContent
                        .replace(/(Adobe\s*)?Photoshop/g, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#001e36] text-[#31a8ff] text-[10px] font-black mr-1.5 border border-[#31a8ff]/20 shadow-[0_0_8px_rgba(49,168,255,0.2)] align-middle select-none">Ps</span>Photoshop</span>')
                        .replace(/Adobe\s*Illustrator|Illustrator/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#330000] text-[#ff9a00] text-[10px] font-black mr-1.5 border border-[#ff9a00]/20 shadow-[0_0_8px_rgba(255,154,0,0.2)] align-middle select-none">Ai</span>Illustrator</span>')
                        .replace(/Adobe\s*Premiere|Premiere/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2a065c] text-[#ea77ff] text-[10px] font-black mr-1.5 border border-[#ea77ff]/20 shadow-[0_0_8px_rgba(234,119,255,0.2)] align-middle select-none">Pr</span>Adobe Premiere</span>')
                        .replace(/Capcut/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none overflow-hidden"><img src="/capcut-circle.png" alt="Capcut" class="w-full h-full object-cover scale-[1.3]" /></span>Capcut</span>')
                        .replace(/Figma/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2c2c2c] mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none"><svg width="10" height="15" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg"><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v19H9.5A9.5 9.5 0 0 1 0 47.5z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg></span>Figma</span>');

                      return (
                        <div key={block.id} className="w-full flex flex-col">
                          {index > 0 && <div className="w-full h-[1px] bg-zinc-800/80 my-16 md:my-24 shadow-none" />}
                          <div className={cn("flex flex-col gap-8 md:gap-16", isExpanded ? "items-start" : "items-start", !isAdmin ? "md:flex-row" : (globalPreviewMode !== 'desktop' ? "flex-col" : "flex-row"))}>
                          {/* Title Cột trái (Sticky) */}
                          <div 
                            className={cn("w-full flex gap-4 h-fit", 
                              isExpanded ? "items-center" : "items-start",
                              !isAdmin ? (isExpanded ? "md:w-5/12 md:sticky" : "md:w-5/12") : (globalPreviewMode !== 'desktop' ? "w-full" : (isExpanded ? "w-5/12 sticky" : "w-5/12"))
                            )}
                            style={isExpanded ? { 
                              top: 'calc(var(--header-height, 0px) + 80px)',
                              transition: 'top 0.7s ease-out'
                            } : {}}
                          >
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-500 text-[14px] font-normal text-[var(--text-muted)] bg-transparent shrink-0">
                              {index + 1}
                            </span>
                            <div 
                              className={cn("text-xl md:text-2xl font-bold text-[var(--text-primary)] [&_p]:m-0", !isExpanded && "mt-[2px]")}
                              dangerouslySetInnerHTML={{ __html: cleanHtmlColors(block.title || `Block ${index + 1}`) }}
                            />
                          </div>
                          {/* Nội dung Cột phải */}
                          <div
                            className={cn("w-full text-[var(--text-muted)] leading-relaxed prose prose-sm dark:prose-invert max-w-none text-justify [&_p:first-child]:!mt-0 [&_p]:mb-4 [&_ul]:my-2 [&_li]:my-2 [&_strong]:text-[var(--text-secondary)] [&_strong]:font-semibold [&_ul]:list-none [&_ul]:pl-0 [&_hr]:border-t [&_hr]:border-solid [&_hr]:border-zinc-800 [&_hr]:my-8 [&_hr]:shadow-none",
                                !isAdmin ? "md:w-7/12" : (globalPreviewMode !== 'desktop' ? "w-full" : "w-7/12")
                            )}
                            style={!isExpanded ? { marginTop: '6px' } : {}}
                            dangerouslySetInnerHTML={{ __html: cleanHtmlColors(cleanContent) }}
                          />
                        </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Overlay mờ khi rút gọn */}
                  {!isExpanded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent pointer-events-none z-10 backdrop-blur-[1.5px]" />
                  )}
                </motion.div>
              )}
          </motion.div>
        </div>

        {isEditor && isExpanded && (
          <div className="absolute bottom-16 right-4 md:right-8 z-[100]">
            <a
              href="/admin/about"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center bg-white text-black p-3 rounded-full border border-white/20 hover:bg-zinc-200 transition-all duration-300 shadow-xl pointer-events-auto"
              title="Chỉnh sửa cột mở rộng"
            >
              <Pencil className="w-5 h-5" />
            </a>
          </div>
        )}
      </section>
    </SectionEditor>
  );
}
