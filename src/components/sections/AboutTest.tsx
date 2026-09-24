"use client";

import { cleanHtmlColors } from "@/lib/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { getResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "@/components/builder/RichTextEditor";

function stripMentionClasses(html: string): string {
  return html.replace(
    /<span\b([^>]*?)data-type="mention"([^>]*?)class="([^"]*)"/gi,
    '<span$1data-type="mention"$2class="mention"'
  ).replace(
    /<span\b([^>]*?)class="([^"]*?)"([^>]*?)data-type="mention"/gi,
    '<span$1class="mention"$3data-type="mention"'
  );
}

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
    content: "About me",
    fontSize: { desktop: 30, tablet: 24, mobile: 18 },
    lineHeight: { desktop: '1.2', tablet: '1.2', mobile: '1.2' }
  },
  subheading: {
    content: "Visual Graphic Designer<br/>7 Years of Experience",
    fontSize: { desktop: 16, tablet: 14, mobile: 12 },
    lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' }
  },
  paragraphs: [
    {
      content: "Visual Graphic Designer - Thiết kế đồ hoạ với hơn 7 năm đồng hành cùng nhiều thương hiệu trong và ngoài nước. Thế mạnh của tôi là xây dựng hình ảnh chuyên nghiệp, thẩm mỹ và có chiến lược.",
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
  title?: string;
  content: string;
};

export function AboutTest({ sectionId = "about" }: { sectionId?: string }) {
  const [heading, setHeading] = useState<RichTextData>(DEFAULTS.heading);
  const [subheading, setSubheading] = useState<RichTextData>(DEFAULTS.subheading);
  const [paragraphs, setParagraphs] = useState<RichTextData[]>(DEFAULTS.paragraphs);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [expandedBlocks, setExpandedBlocks] = useState<ExpandedBlock[]>([]);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(true);
  const expandRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isExpanded && expandRef.current && isAnimationComplete) {
      setTimeout(() => {
        const y = expandRef.current!.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y - 100, behavior: 'smooth' });
      }, 50);
    }
  }, [isExpanded, isAnimationComplete]);

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
          setParagraphs(d.paragraphs.map(p => normalize(p)));
        }
        if (d.avatarUrl !== undefined) setAvatarUrl(d.avatarUrl);
        
        if (d.expandedBlocks !== undefined) {
          const parsedBlocks = d.expandedBlocks.map((b: any) => {
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

  if (!loaded) return null;

  return (
    <section id="about" className="relative bg-[var(--bg-base)] transition-all duration-700 pt-[128px] pb-[128px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Top Section */}
          <div className="mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              
              {/* CỘT TRÁI: Avatar + Heading + Subheading */}
              <div className="w-full md:w-5/12 flex flex-col gap-6">
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
                        "w-16 h-16 md:w-20 md:h-20"
                      )}
                    />
                  </motion.div>
                )}
                <div className="space-y-2">
                  <div
                    className="tracking-tighter text-[var(--text-primary)] text-balance font-bold text-[24px] md:text-[32px] [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(heading.content, 'desktop')) }}
                  />
                  <div
                    className="text-[var(--text-muted)] whitespace-pre-wrap text-[16px] md:text-[20px] font-medium leading-[1.4] [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subheading.content, 'desktop')) }}
                  />
                </div>
              </div>

              {/* CỘT PHẢI: Paragraphs + Nút */}
              {/* md:mt-16 to push it down initially, but user can add empty lines in Tiptap */}
              <div className="w-full md:w-7/12 flex flex-col space-y-6 md:mt-16">
                <div className="space-y-4 text-[var(--text-muted)]">
                  {paragraphs.map((p, i) => (
                    <div
                      key={i}
                      className="text-justify text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-muted)] [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(p.content, 'desktop')) }}
                    />
                  ))}
                </div>

                {expandedBlocks.length > 0 && (
                  <div className="pt-2 flex flex-col items-start bg-transparent">
                    <button
                      onClick={() => {
                        setIsExpanded(!isExpanded);
                        setIsAnimationComplete(false);
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

          {/* Expanded Detail Content (2 cột riêng biệt) */}
          <AnimatePresence initial={false}>
            {isExpanded && expandedBlocks.length > 0 && (
              <motion.div
                ref={expandRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setIsAnimationComplete(true)}
                className={cn(
                  "relative",
                  isAnimationComplete ? "overflow-visible" : "overflow-hidden"
                )}
              >
                <div className="mt-12 pt-12 border-t border-[var(--border-subtle)] flex flex-col gap-16">
                  {expandedBlocks.map((block, index) => {
                    let cleanContent = stripMentionClasses(block.content);
                    cleanContent = cleanContent
                        .replace(/(Adobe\s*)?Photoshop/g, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#001e36] text-[#31a8ff] text-[10px] font-black mr-1.5 border border-[#31a8ff]/20 shadow-[0_0_8px_rgba(49,168,255,0.2)] align-middle select-none">Ps</span>Photoshop</span>')
                        .replace(/Adobe\s*Illustrator|Illustrator/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#330000] text-[#ff9a00] text-[10px] font-black mr-1.5 border border-[#ff9a00]/20 shadow-[0_0_8px_rgba(255,154,0,0.2)] align-middle select-none">Ai</span>Illustrator</span>')
                        .replace(/Adobe\s*Premiere|Premiere/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2a065c] text-[#ea77ff] text-[10px] font-black mr-1.5 border border-[#ea77ff]/20 shadow-[0_0_8px_rgba(234,119,255,0.2)] align-middle select-none">Pr</span>Adobe Premiere</span>')
                        .replace(/Capcut/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none overflow-hidden"><img src="/capcut-circle.png" alt="Capcut" class="w-full h-full object-cover scale-[1.3]" /></span>Capcut</span>')
                        .replace(/Figma/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2c2c2c] mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none"><svg width="10" height="15" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg"><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v19H9.5A9.5 9.5 0 0 1 0 47.5z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg></span>Figma</span>');

                    return (
                      <div key={block.id} className="flex flex-col md:flex-row gap-8 md:gap-16">
                        {/* Title Cột trái (Sticky) */}
                        <div className="w-full md:w-5/12 flex items-start gap-4 md:sticky md:top-24 h-fit">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-500 text-[14px] font-normal text-[var(--text-muted)] bg-transparent shrink-0">
                            {index + 1}
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mt-1">
                            {block.title || `Block ${index + 1}`}
                          </h3>
                        </div>
                        {/* Nội dung Cột phải */}
                        <div
                          className="w-full md:w-7/12 text-[var(--text-muted)] leading-relaxed prose prose-sm dark:prose-invert max-w-none text-justify [&_p]:mb-4 [&_ul]:my-2 [&_li]:my-2 [&_strong]:text-[var(--text-secondary)] [&_strong]:font-semibold [&_ul]:list-none [&_ul]:pl-0"
                          dangerouslySetInnerHTML={{ __html: cleanHtmlColors(cleanContent) }}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
