"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { ChevronDown, ArrowRight } from "lucide-react";
import { generateSlug } from "@/lib/utils";

/**
 * Strip old embedded Tailwind classes from Tiptap mention tags saved in DB.
 * DB HTML uses data-type="mention" but class has inline Tailwind, NOT "mention".
 * Replace entire class with just "mention" so globals.css controls rendering.
 */
function stripMentionClasses(html: string): string {
  return html.replace(
    /<span\b([^>]*?)data-type="mention"([^>]*?)class="([^"]*)"/gi,
    '<span$1data-type="mention"$2class="mention"'
  ).replace(
    // Also handle case where class comes BEFORE data-type
    /<span\b([^>]*?)class="([^"]*?)"([^>]*?)data-type="mention"/gi,
    '<span$1class="mention"$3data-type="mention"'
  );
}

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

type ExpandedBlock = {
  id: string;
  type: 'full' | 'half';
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
  
  const [avatarUrl, setAvatarUrl] = useState<string>(
    initialContent?.avatarUrl ?? ""
  );
  const [expandedBlocks, setExpandedBlocks] = useState<ExpandedBlock[]>(
    Array.isArray(initialContent?.expandedBlocks) ? initialContent.expandedBlocks : []
  );
  const [isExpanded, setIsExpanded] = useState(false);

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
          avatarUrl?: string;
          expandedBlocks?: any[];
          detailContentLeft?: string;
          detailContentRight?: string;
          detailContent?: string;
        };
        if (d.heading !== undefined) setHeading(normalize(d.heading));
        if (d.subheading !== undefined) setSubheading(normalize(d.subheading));
        if (Array.isArray(d.paragraphs) && d.paragraphs.length > 0) {
          setParagraphs(d.paragraphs.map(p => normalize(p)));
        }
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.avatarUrl !== undefined) setAvatarUrl(d.avatarUrl);
        if (d.expandedBlocks !== undefined) {
          setExpandedBlocks(d.expandedBlocks);
        } else {
          const blocks: ExpandedBlock[] = [];
          const left = d.detailContentLeft || d.detailContent || "";
          const right = d.detailContentRight || "";
          if (left) blocks.push({ id: 'left', type: 'half', content: left });
          if (right) blocks.push({ id: 'right', type: 'half', content: right });
          setExpandedBlocks(blocks);
        }
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

  // Handle clickable mention tags in rendered rich-text HTML
  useEffect(() => {
    // Detect if we're inside an iframe (builder preview)
    const isInsideIframe = window !== window.parent;

    const handleTagClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mention = target.closest('.mention, [data-type="mention"]') as HTMLElement;
      if (!mention) return;

      // Only block clicks when inside builder iframe
      if (isInsideIframe && isEditMode) return;

      e.preventDefault();
      e.stopPropagation();

      const tag = mention.getAttribute('data-id') ||
                  mention.getAttribute('data-label') ||
                  mention.innerText;
      if (tag) {
        const cleanTag = tag.replace(/^#/, '').trim();
        const url = `/tag/${generateSlug(cleanTag)}`;
        // Mở trong tab mới
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
    paddingBottom: paddingBottomData 
  };

        const isEditor = isAdmin && isEditMode;
        const currentPx = globalPreviewMode === 'mobile' ? '1rem' : '3rem';

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      <section 
        id="about" 
        className="relative bg-zinc-950 transition-all duration-700"
        style={{ 
          paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`,
          paddingBottom: isExpanded 
            ? `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 80}px` 
            : '0px',
        }}
      >
        <div 
          className={cn(
            "max-w-4xl mx-auto",
            !isEditor && "px-4 md:px-12"
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
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Avatar left + Text right layout */}
              <div className={cn("flex flex-col md:flex-row gap-6 md:gap-8", avatarUrl ? "md:items-start" : "")}>
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
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-zinc-700/50 shadow-xl shadow-black/30"
                    />
                  </motion.div>
                )}
                <div className="flex-1 space-y-4">
                  {/* Heading (Moved here to perfectly left-align with the rest of the text) */}
                  <div 
                    className="tracking-tighter text-zinc-50 text-balance whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit" 
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
                  {/* Paragraphs */}
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
                        className="whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit"
                        dangerouslySetInnerHTML={{ __html: getResponsiveValue(p.content, globalPreviewMode || 'desktop') }} 
                      />
                    ))}
                  </div>

                  {/* View Detail / Collapse Button - inside text column */}
                  {expandedBlocks.length > 0 && (
                    <div className="pt-1 flex flex-col items-start bg-transparent">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                          "group flex items-center gap-2 text-sm font-medium px-6 py-2 rounded-full transition-all duration-300 border",
                          isExpanded 
                            ? "text-zinc-400 border-zinc-700/60 hover:border-zinc-500 hover:text-zinc-300"
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

                      {/* Teaser Preview when not expanded */}
                      {/* Teaser Preview - 1 short blurred snippet */}
                      {!isExpanded && expandedBlocks.length > 0 && (
                        <div className="relative h-52 overflow-hidden pointer-events-none select-none w-full mt-2">
                          <div 
                            className="prose prose-invert prose-zinc opacity-40 blur-[2px]"
                            // Teaser: strip stale mention classes too (no click needed here)
                            dangerouslySetInnerHTML={{ __html: stripMentionClasses(expandedBlocks[0].content) }}
                          />
                          {/* Gradient fade to black */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Detail Content (Aligned within max-w-4xl) */}
            <AnimatePresence initial={false}>
              {isExpanded && expandedBlocks.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0, filter: "blur(12px)", scaleY: 0.9, originY: 0 }}
                  animate={{ height: "auto", opacity: 1, filter: "blur(0px)", scaleY: 1, originY: 0 }}
                  exit={{ height: 0, opacity: 0, filter: "blur(12px)", scaleY: 0.9, originY: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "mt-16 pt-16 border-t border-zinc-800/60 grid gap-8 lg:gap-16",
                    globalPreviewMode === 'mobile' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                  )}>
                    {expandedBlocks.map((block) => {
                      // Bắt các số dạng "1. ", "2. ", "10. " ở đầu câu (trong thẻ heading/paragraph) 
                      // vớt cả chữ số nằm trong thẻ <span>/<strong> sinh ra bởi công cụ đổi màu của Tiptap
                      // Step 1: strip stale Tailwind classes from mention spans (DB content)
                      const strippedContent = stripMentionClasses(block.content);
                      // Step 2: style numbered list items as circular badges
                      let cleanContent = strippedContent.replace(
                        /(<(?:h[1-6]|p|li|div)[^>]*>(?:\s*<[^>]+>)*)\s*(\d+)\.(?:\s|&nbsp;)*/gi, 
                        '$1<span class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-500 text-[15px] font-normal text-zinc-400 bg-transparent mr-3 align-middle -translate-y-[2px] shrink-0 transition-all duration-300 hover:border-blue-400/80 hover:text-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] cursor-default">$2</span>'
                      );

                      // Step 3: Add software icons (Ps, Ai, Pr)
                      cleanContent = cleanContent
                        .replace(/(Adobe\s*)?Photoshop/g, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#001e36] text-[#31a8ff] text-[10px] font-black mr-1.5 border border-[#31a8ff]/20 shadow-[0_0_8px_rgba(49,168,255,0.2)] align-middle select-none">Ps</span>Photoshop')
                        .replace(/Adobe\s*Illustrator|Illustrator/gi, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#330000] text-[#ff9a00] text-[10px] font-black mr-1.5 border border-[#ff9a00]/20 shadow-[0_0_8px_rgba(255,154,0,0.2)] align-middle select-none">Ai</span>Illustrator')
                        .replace(/Adobe\s*Premiere|Premiere/gi, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2a065c] text-[#ea77ff] text-[10px] font-black mr-1.5 border border-[#ea77ff]/20 shadow-[0_0_8px_rgba(234,119,255,0.2)] align-middle select-none">Pr</span>Adobe Premiere')
                        .replace(/Capcut/gi, '<svg viewBox="0 0 457.143 457.143" class="inline-block w-5 h-5 mr-1.5 align-middle shadow-[0_0_8px_rgba(255,255,255,0.3)]"><circle cx="228.571" cy="228.571" r="228.571" fill="black"/><path d="M331.429 154.286h-31.429L228.571 225.714l71.429 71.429h31.429c5.714 0 11.429-5.714 11.429-11.429v-25.714l-34.286-34.286 34.286-34.286v-25.714c0-5.715-5.715-11.428-11.429-11.428z" fill="#fff"/><path d="M125.714 154.286h31.429l71.429 71.429-71.429 71.429H125.714c-5.714 0-11.429-5.714-11.429-11.429v-25.714l34.286-34.286-34.286-34.286v-25.714c.143-5.715 5.857-11.428 11.429-11.428z" fill="#fff"/><path d="M228.571 200l25.714-25.714H202.857L228.571 200zM228.571 311.429l25.714 25.714H202.857l25.714-25.714z" fill="#fff"/></svg>Capcut');

                      return (
                        <div 
                          key={block.id}
                          className={cn(
                            "text-zinc-400 font-light leading-relaxed prose prose-invert prose-zinc max-w-none",
                            "[&_p]:text-zinc-400 [&_p]:leading-relaxed [&_p]:mb-4",
                            
                            "[&_h1]:text-zinc-200 [&_h1]:font-bold [&_h1]:mb-6",
                            "[&_h2]:text-zinc-200 [&_h2]:font-bold [&_h2]:mb-4",
                            "[&_h3]:text-zinc-300 [&_h3]:font-semibold [&_h3]:mb-2",
                            
                            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:text-zinc-400",
                            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:text-zinc-400",
                            
                            "[&_li]:mb-1",
                            "[&_a]:text-blue-400 [&_a]:underline",
                            "[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-500",
                            "[&_img]:rounded-xl [&_img]:my-6 [&_img]:shadow-2xl",
                            "[&_hr]:border-zinc-800 [&_hr]:my-6",
                            block.type === 'full' ? 'md:col-span-2' : ''
                          )}
                          dangerouslySetInnerHTML={{ __html: cleanContent }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </SectionEditor>
  );
}
