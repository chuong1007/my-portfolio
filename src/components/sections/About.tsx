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
  const expandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && expandRef.current) {
      setTimeout(() => {
        const y = expandRef.current!.getBoundingClientRect().top + window.scrollY;
        // Scroll so the expanded content is below the header, but the line and button are hidden under the header
        window.scrollTo({ top: y - 35, behavior: 'smooth' });
      }, 300); // wait a bit for the height animation to start
    }
  }, [isExpanded]);

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
          // Migration logic: if they have old detailContentLeft/Right in DB, use it instead of hardcoded defaults!
          const left = (d as any).detailContentLeft || (d as any).detailContent || "";
          const right = (d as any).detailContentRight || "";
          
          if (left || right) {
            const blocks: ExpandedBlock[] = [];
            if (left) blocks.push({ id: 'left', type: 'half', content: left });
            if (right) blocks.push({ id: 'right', type: 'half', content: right });
            setExpandedBlocks(blocks);
          } else {
            // Only use hardcoded defaults if there's no data at all
            setAvatarUrl('/avatar-emoji.svg');
            const blocks: ExpandedBlock[] = [
              {
                id: "block-1",
                type: "half",
                content: "<p><strong>1. Giới thiệu bản thân</strong></p><p>Graphic Designer với hơn 7 năm kinh nghiệm xây dựng hình ảnh thương hiệu và ấn phẩm truyền thông đa nền tảng - từ nhận diện thương hiệu, bao bì, giao diện website đến các ấn phẩm chiến dịch (Banner, Poster, Social Media post, KV).</p><p>Có kinh nghiệm dựng và chỉnh sửa video bằng Capcut, đồng thời ứng dụng công cụ AI để tạo video từ hình ảnh tĩnh, phục vụ nội dung marketing nhanh và hiệu quả.</p><p>Kết hợp tư duy chiến lược với thẩm mỹ hiện đại, quen thuộc với việc phối hợp cùng đội ngũ Content và Marketing để phát triển ý tưởng hình ảnh, đảm bảo tính đồng bộ và bám sát mục tiêu chiến dịch. Khả năng thích ứng nhanh, làm việc tốt dưới áp lực deadline và luôn cập nhật xu hướng thiết kế, công nghệ AI mới.</p>"
              },
              {
                id: "block-2",
                type: "half",
                content: "<p><strong>2. Kỹ năng chuyên môn</strong></p><ul><li><strong>Thiết kế:</strong> Photoshop, Illustrator (Sử dụng thành thạo). Ứng dụng AI vào thiết kế đồ họa.</li><li><strong>Dựng phim:</strong> Adobe Premiere, Capcut,... Ứng dụng AI vào dựng và edit clip.</li><li><strong>Kỹ năng mềm:</strong> Làm việc nhóm & Quản lý tiến độ, Giao tiếp & Thuyết trình ý tưởng, Tiếng Anh giao tiếp công việc.</li></ul>"
              },
              {
                id: "block-3",
                type: "full",
                content: "<p><strong>3. Mục tiêu & Sở thích</strong></p><ul><li><strong>Mục tiêu:</strong> Không ngừng nghiên cứu tâm lý thị giác và hành vi người dùng ứng dụng vào thiết kế; hướng tới việc dẫn dắt các dự án sáng tạo toàn diện từ định vị thương hiệu, tối ưu trải nghiệm số cho đến hoàn thiện bao bì sản phẩm.</li><li><strong>Sở thích:</strong> Viết lách, nghe nhạc, xem phim, du lịch và đặc biệt hứng thú nghiên cứu về tâm lý học ứng dụng vào thiết kế.</li></ul>"
              },
              {
                id: "block-4",
                type: "full",
                content: "<p><strong>4. Kinh nghiệm làm việc</strong></p><p><strong>FREELANCER DESIGNER (02/2020 - Nay)</strong><br><strong>Senior Graphic / Web UI & Packaging Designer</strong></p><ul><li>Nghiên cứu, lên khung cấu trúc và thiết kế giao diện Website/Landing Page chuẩn UI/UX trên nền tảng Figma, đảm bảo tính thẩm mỹ và tối ưu bàn giao cho lập trình viên.</li><li>Định hướng phong cách hình ảnh chiến dịch (Key Visual, Poster, Banner), bảo đảm tính đồng bộ thị giác và độ nhận diện thương hiệu trên mọi điểm chạm.</li><li>Phụ trách thiết kế trọn gói từ bộ nhận diện thương hiệu (Logo, Brand Guidelines), bao bì sản phẩm đến các ấn phẩm truyền thông số cho nhiều nhóm khách hàng doanh nghiệp.</li></ul><br><p><strong>CÔNG TY CPDV AZSEO (09/2018 - 02/2020)</strong><br><strong>Leader Team Graphic, thiết kế giao diện Website / Chạy quảng cáo Google - Facebook.</strong></p><ul><li>Quản lý nhóm thiết kế, trực tiếp phân chia khối lượng công việc, kiểm soát chất lượng và tiến độ bàn giao ấn phẩm cho các dự án khách hàng của công ty.</li><li>Thiết kế giao diện Website (UI) chuẩn responsive cho các dự án trên nền tảng WordPress.</li><li>Phối hợp cùng phòng Marketing lên ý tưởng hình ảnh, tối ưu định dạng ấn phẩm quảng cáo chạy Ads (Google, Facebook) nhằm nâng cao tỷ lệ chuyển đổi.</li></ul><br><p><strong>VIỆN THẨM MỸ JENNA THANH (07/2016 - 08/2017)</strong><br><strong>Nhân viên thiết kế đồ họa / Chạy quảng cáo Google - Facebook</strong></p><ul><li>Thiết kế hình ảnh social, tối ưu cho quảng cáo Google, Facebook.</li><li>Thiết kế các ấn phẩm in ấn: Brochure, Name card, Thẻ bảo hành, Standee.</li><li>Sáng tạo nội dung (Copywriting), chăm sóc Fanpage và Website.</li><li>Lên kế hoạch từ khóa và tối ưu hóa ngân sách Ads.</li></ul>"
              }
            ];
            setExpandedBlocks(blocks);
          }
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
    paddingBottom: paddingBottomData,
    avatarUrl,
    expandedBlocks
  };

  const isEditor = isAdmin && isEditMode;
  const currentPx = globalPreviewMode === 'mobile' ? '1rem' : '3rem';

  

  return (
    <SectionEditor sectionId={sectionId} initialData={initialData} onSave={fetchContent} isVisible={isVisible}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .about-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          margin-top: var(--mt-mob);
          padding-bottom: var(--pb-mob);
          margin-bottom: var(--mb-mob);
        }
        .about-inner:not(.is-editor) {
          padding-left: 16px;
          padding-right: 16px;
        }
        .about-container ul, .about-container ol, .about-container li {
          list-style: none !important;
        }
        .about-container li::marker {
          content: none !important;
          color: transparent !important;
        }
        .about-heading:not(.is-editor) {
          font-size: var(--fs-mob);
          line-height: var(--lh-mob);
          font-family: var(--ff-mob);
          font-weight: var(--fw-mob);
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          text-wrap: balance;
        }
        .about-heading:not(.is-editor) p,
        .about-heading:not(.is-editor) h1,
        .about-heading:not(.is-editor) h2,
        .about-heading:not(.is-editor) h3 {
          white-space: normal !important;
        }
        .about-p:not(.is-editor) p,
        .about-p:not(.is-editor) div {
          white-space: normal !important;
        }
        .about-p:not(.is-editor) {
          font-size: var(--fs-p-mob);
          white-space: normal;
        }
        .about-subheading:not(.is-editor) {
          font-size: clamp(12px, 6cqi, var(--fs-sub-mob));
          white-space: pre-wrap;
          line-height: var(--lh-sub-mob);
          font-family: var(--ff-sub-mob);
          font-weight: var(--fw-sub-mob);
        }
        
        .about-layout:not(.is-editor) {
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .about-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            margin-top: var(--mt-tab);
            padding-bottom: var(--pb-tab);
            margin-bottom: var(--mb-tab);
          }
          .about-inner:not(.is-editor) {
            padding-left: 48px;
            padding-right: 48px;
          }
          .about-heading:not(.is-editor) {
            font-size: var(--fs-tab);
            line-height: var(--lh-tab);
            font-family: var(--ff-tab);
            font-weight: var(--fw-tab);
          }
          .about-subheading:not(.is-editor) {
            font-size: clamp(14px, 4cqi, var(--fs-sub-tab));
            white-space: pre-wrap;
            line-height: var(--lh-sub-tab);
            font-family: var(--ff-sub-tab);
            font-weight: var(--fw-sub-tab);
          }
          .about-p:not(.is-editor) {
            font-size: var(--fs-p-tab);
          }
          .about-layout:not(.is-editor) {
            flex-direction: row;
          }
        }

        @media (min-width: 1024px) {
          .about-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            margin-top: var(--mt-desk);
            padding-bottom: var(--pb-desk);
            margin-bottom: var(--mb-desk);
          }
          .about-inner:not(.is-editor) {
            padding-left: 0;
            padding-right: 0;
          }
          .about-heading:not(.is-editor) {
            font-size: var(--fs-desk);
            line-height: var(--lh-desk);
            font-family: var(--ff-desk);
            font-weight: var(--fw-desk);
          }
          .about-subheading:not(.is-editor) {
            font-size: clamp(14px, 3.5cqi, var(--fs-sub-desk));
            white-space: pre-wrap;
            line-height: var(--lh-sub-desk);
            font-family: var(--ff-sub-desk);
            font-weight: var(--fw-sub-desk);
          }
          .about-p:not(.is-editor) {
            font-size: var(--fs-p-desk);
          }
        }
      `}} />

      <section id="about"
        className={cn("about-container relative bg-[var(--bg-base)] transition-all duration-700", !isEditor && "not-is-editor", isEditor && "is-editor")}
        style={{
          paddingTop: isEditor ? (Number(getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0) >= 0 ? `${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px` : '0px') : undefined,
          marginTop: isEditor ? (Number(getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0) < 0 ? `${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px` : '0px') : undefined,
          paddingBottom: isEditor ? (Number(getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)) >= 0 ? `${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)}px` : '0px') : undefined,
          marginBottom: isEditor ? (Number(getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 0) < 0 ? `${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop')}px` : '0px') : undefined,
          "--pt-desk": Number(getResponsiveValue(paddingTopData, 'desktop') || 0) >= 0 ? `${getResponsiveValue(paddingTopData, 'desktop') || 0}px` : '0px',
          "--pt-tab": Number(getResponsiveValue(paddingTopData, 'tablet') || 0) >= 0 ? `${getResponsiveValue(paddingTopData, 'tablet') || 0}px` : '0px',
          "--pt-mob": Number(getResponsiveValue(paddingTopData, 'mobile') || 0) >= 0 ? `${getResponsiveValue(paddingTopData, 'mobile') || 0}px` : '0px',
          "--mt-desk": Number(getResponsiveValue(paddingTopData, 'desktop') || 0) < 0 ? `${getResponsiveValue(paddingTopData, 'desktop') || 0}px` : '0px',
          "--mt-tab": Number(getResponsiveValue(paddingTopData, 'tablet') || 0) < 0 ? `${getResponsiveValue(paddingTopData, 'tablet') || 0}px` : '0px',
          "--mt-mob": Number(getResponsiveValue(paddingTopData, 'mobile') || 0) < 0 ? `${getResponsiveValue(paddingTopData, 'mobile') || 0}px` : '0px',
          "--pb-desk": Number(getResponsiveValue(paddingBottomData, 'desktop') || (isExpanded ? 80 : 0)) >= 0 ? `${getResponsiveValue(paddingBottomData, 'desktop') || (isExpanded ? 80 : 0)}px` : '0px',
          "--pb-tab": Number(getResponsiveValue(paddingBottomData, 'tablet') || (isExpanded ? 80 : 0)) >= 0 ? `${getResponsiveValue(paddingBottomData, 'tablet') || (isExpanded ? 80 : 0)}px` : '0px',
          "--pb-mob": Number(getResponsiveValue(paddingBottomData, 'mobile') || (isExpanded ? 80 : 0)) >= 0 ? `${getResponsiveValue(paddingBottomData, 'mobile') || (isExpanded ? 80 : 0)}px` : '0px',
          "--mb-desk": Number(getResponsiveValue(paddingBottomData, 'desktop') || 0) < 0 ? `${getResponsiveValue(paddingBottomData, 'desktop')}px` : '0px',
          "--mb-tab": Number(getResponsiveValue(paddingBottomData, 'tablet') || 0) < 0 ? `${getResponsiveValue(paddingBottomData, 'tablet')}px` : '0px',
          "--mb-mob": Number(getResponsiveValue(paddingBottomData, 'mobile') || 0) < 0 ? `${getResponsiveValue(paddingBottomData, 'mobile')}px` : '0px',
        } as React.CSSProperties}
      >
        <div
          className={cn("about-inner max-w-4xl mx-auto", !isEditor && "not-is-editor", isEditor && "is-editor",
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
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Avatar left + Text right layout */}
              <div className={cn("about-layout flex", !isEditor && "not-is-editor", isEditor && "is-editor",
    !isAdmin ? 'flex-col md:flex-row gap-2 md:gap-8' : (globalPreviewMode !== 'desktop' ? 'flex-col gap-2' : 'flex-row gap-8'),
    avatarUrl ? (!isAdmin ? "md:items-start" : (globalPreviewMode === 'desktop' ? "items-start" : "")) : ""
  )}>
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
                        !isAdmin ? "w-16 h-16 md:w-24 md:h-24" : (globalPreviewMode !== 'desktop' ? "w-16 h-16" : "w-24 h-24")
                      )}
                    />
                  </motion.div>
                )}
                <div className="flex-1 w-full min-w-0 space-y-4 @container">
                  {/* Heading (Moved here to perfectly left-align with the rest of the text) */}
                  <div
                    className={cn("about-heading tracking-tighter text-[var(--text-primary)] text-balance [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit", !isEditor && "not-is-editor", isEditor && "is-editor")}
                    style={{
                      fontSize: isEditor ? `${heading.fontSize?.[globalPreviewMode || 'desktop'] || 30}px` : undefined,
                      lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                      fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                      fontWeight: isEditor ? (heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                      color: heading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : heading.textColor?.[globalPreviewMode || 'desktop'],
                      "--fs-desk": `${heading.fontSize?.desktop || 30}px`,
                      "--fs-tab": `${heading.fontSize?.tablet || 24}px`,
                      "--fs-mob": `${heading.fontSize?.mobile || 18}px`,
                      "--lh-desk": heading.lineHeight?.desktop || '1.1',
                      "--lh-tab": heading.lineHeight?.tablet || '1.1',
                      "--lh-mob": heading.lineHeight?.mobile || '1.1',
                      "--ff-desk": heading.fontFamily?.desktop || 'inherit',
                      "--ff-tab": heading.fontFamily?.tablet || 'inherit',
                      "--ff-mob": heading.fontFamily?.mobile || 'inherit',
                      "--fw-desk": heading.fontWeight?.desktop || '700',
                      "--fw-tab": heading.fontWeight?.tablet || '700',
                      "--fw-mob": heading.fontWeight?.mobile || '700',
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(heading.content, globalPreviewMode || 'desktop')) }}
                  />
                  <div
                    className={cn("about-subheading text-[var(--text-muted)] whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}
                    style={{
                      fontSize: isEditor ? `clamp(14px, ${globalPreviewMode === 'mobile' ? '6cqi' : globalPreviewMode === 'tablet' ? '4cqi' : '3.5cqi'}, ${getResponsiveValue(subheading.fontSize, globalPreviewMode || 'desktop') || 18}px)` : undefined,
                      lineHeight: isEditor ? (getResponsiveValue(subheading.lineHeight, globalPreviewMode || 'desktop') || '1.5') : undefined,
                      fontFamily: isEditor ? (subheading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                      fontWeight: isEditor ? (subheading.fontWeight?.[globalPreviewMode || 'desktop'] || '400') : undefined,
                      color: subheading.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : subheading.textColor?.[globalPreviewMode || 'desktop'],
                      "--fs-sub-desk": `${subheading.fontSize?.desktop || 18}px`,
                      "--fs-sub-tab": `${subheading.fontSize?.tablet || 16}px`,
                      "--fs-sub-mob": `${subheading.fontSize?.mobile || 14}px`,
                      "--lh-sub-desk": subheading.lineHeight?.desktop || '1.5',
                      "--lh-sub-tab": subheading.lineHeight?.tablet || '1.5',
                      "--lh-sub-mob": subheading.lineHeight?.mobile || '1.5',
                      "--ff-sub-desk": subheading.fontFamily?.desktop || 'inherit',
                      "--ff-sub-tab": subheading.fontFamily?.tablet || 'inherit',
                      "--ff-sub-mob": subheading.fontFamily?.mobile || 'inherit',
                      "--fw-sub-desk": subheading.fontWeight?.desktop || '400',
                      "--fw-sub-tab": subheading.fontWeight?.tablet || '400',
                      "--fw-sub-mob": subheading.fontWeight?.mobile || '400',
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subheading.content, globalPreviewMode || 'desktop')) }}
                  />
                  {/* Paragraphs */}
                  <div className="space-y-4 text-[var(--text-muted)]">
                    {paragraphs.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: isEditor ? `${p.fontSize?.[globalPreviewMode || 'desktop'] || 18}px` : undefined,
                          lineHeight: isEditor ? (p.lineHeight?.[globalPreviewMode || 'desktop'] || '1.6') : undefined,
                          fontFamily: isEditor ? (p.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                          fontWeight: isEditor ? (p.fontWeight?.[globalPreviewMode || 'desktop'] || '400') : undefined,
                          color: p.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : p.textColor?.[globalPreviewMode || 'desktop'],
                          "--fs-p-desk": `${p.fontSize?.desktop || 18}px`,
                          "--fs-p-tab": `${p.fontSize?.tablet || 16}px`,
                          "--fs-p-mob": `${p.fontSize?.mobile || 14}px`,
                        } as React.CSSProperties}
                        className={cn("about-p text-justify [text-wrap:pretty] [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit", !isEditor && "not-is-editor")}
                        dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(p.content, globalPreviewMode || 'desktop')) }}
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

                      {/* Teaser Preview when not expanded */}
                      {/* Teaser Preview - 1 short blurred snippet */}
                      {!isExpanded && expandedBlocks.length > 0 && (
                        <div className="relative h-52 overflow-hidden pointer-events-none select-none w-full mt-2">
                          <div
                            className="prose dark:prose-invert opacity-40 blur-[2px]"
                            // Teaser: strip stale mention classes too (no click needed here)
                            dangerouslySetInnerHTML={{ __html: cleanHtmlColors(stripMentionClasses(expandedBlocks[0].content)) }}
                          />
                          {/* Gradient fade to black */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/70 to-transparent" />
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
                  ref={expandRef}
                  initial={{ height: 0, opacity: 0, filter: "blur(12px)", scaleY: 0.9, originY: 0 }}
                  animate={{ height: "auto", opacity: 1, filter: "blur(0px)", scaleY: 1, originY: 0 }}
                  exit={{ height: 0, opacity: 0, filter: "blur(12px)", scaleY: 0.9, originY: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden relative"
                >
<div className={cn("mt-8 pt-8 border-t border-[var(--border-subtle)] grid gap-x-12 lg:gap-x-20 gap-y-0.5",
                    !isAdmin ? "grid-cols-1 md:grid-cols-2" : (globalPreviewMode === 'desktop' ? "grid-cols-2" : "grid-cols-1")
                  )}>
                    {expandedBlocks.map((block) => {
                      // Bắt các số dạng "1. ", "2. ", "10. " ở đầu câu (trong thẻ heading/paragraph) 
                      // vớt cả chữ số nằm trong thẻ <span>/<strong> sinh ra bởi công cụ đổi màu của Tiptap
                      // Step 1: strip stale Tailwind classes from mention spans (DB content)
                      const strippedContent = stripMentionClasses(block.content);
                      // Step 2: style numbered list items as circular badges
                      let cleanContent = strippedContent.replace(
                        /(<(?:h[1-6]|p|li|div)[^>]*>(?:\s*<[^>]+>)*)\s*(\d+)\.(?:\s|&nbsp;)*/gi,
                        '$1<span class="inline-flex items-center justify-center w-7 h-7 rounded-full border border-zinc-500 text-[14px] font-normal text-[var(--text-muted)] bg-transparent mr-3 align-middle -translate-y-[2px] shrink-0 transition-all duration-300 hover:border-blue-400/80 hover:text-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] cursor-default">$2</span>'
                      );

                      // Step 3: Add software icons (Ps, Ai, Pr, Figma)
                      cleanContent = cleanContent
                        .replace(/(Adobe\s*)?Photoshop/g, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#001e36] text-[#31a8ff] text-[10px] font-black mr-1.5 border border-[#31a8ff]/20 shadow-[0_0_8px_rgba(49,168,255,0.2)] align-middle select-none">Ps</span>Photoshop</span>')
                        .replace(/Adobe\s*Illustrator|Illustrator/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#330000] text-[#ff9a00] text-[10px] font-black mr-1.5 border border-[#ff9a00]/20 shadow-[0_0_8px_rgba(255,154,0,0.2)] align-middle select-none">Ai</span>Illustrator</span>')
                        .replace(/Adobe\s*Premiere|Premiere/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2a065c] text-[#ea77ff] text-[10px] font-black mr-1.5 border border-[#ea77ff]/20 shadow-[0_0_8px_rgba(234,119,255,0.2)] align-middle select-none">Pr</span>Adobe Premiere</span>')
                        .replace(/Capcut/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none overflow-hidden"><img src="/capcut-circle.png" alt="Capcut" class="w-full h-full object-cover scale-[1.3]" /></span>Capcut</span>')
                        .replace(/Figma/gi, '<span class="whitespace-nowrap"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#2c2c2c] mr-1.5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)] align-middle select-none"><svg width="10" height="15" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg"><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v19H9.5A9.5 9.5 0 0 1 0 47.5z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg></span>Figma</span>');

                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "text-[var(--text-muted)] leading-snug prose prose-sm dark:prose-invert max-w-none text-justify",
                            "[&_p]:mb-3 [&_ul]:my-2 [&_li]:my-1",
                            "[&_strong]:text-[var(--text-secondary)] [&_strong]:font-semibold",
                            "[&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_li]:relative [&_li]:list-none",
                            "[&_li]:mb-0",
                            "[&_a]:text-blue-400 [&_a]:underline",
                            "[&_span.mention]:text-blue-400 [&_span.mention]:cursor-default [&_span.mention]:transition-colors",
                            "[&_hr]:my-3 [&_hr]:border-[var(--border-default)]",
                            block.type === 'full' ? (!isAdmin ? 'md:col-span-2' : (globalPreviewMode === 'desktop' ? 'col-span-2' : 'col-span-1')) : ''
                          )}
                          dangerouslySetInnerHTML={{ __html: cleanHtmlColors(cleanContent) }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
