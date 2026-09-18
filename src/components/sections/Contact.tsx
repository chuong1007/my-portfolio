"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Facebook, MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "@/components/SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "@/components/builder/RichTextEditor";

const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  return html
    .replace(/color:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi, 'color: inherit')
    .replace(/-webkit-text-fill-color:\s*transparent/gi, '')
    .replace(/background:\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\s*text/gi, '');
};

const getSafeColor = (color?: string | null) => {
  if (!color || color === 'inherit') return undefined;
  const upper = color.toUpperCase();
  if (upper === '#FFFFFF' || upper === '#FFF' || upper === 'RGB(255, 255, 255)') {
    return 'var(--text-primary)';
  }
  return color;
};

const DEFAULTS = {
  heading: { 
    content: "Let's Connect", 
    fontSize: { desktop: 80, tablet: 48, mobile: 32 },
    lineHeight: { desktop: '1.1', tablet: '1.1', mobile: '1.1' }
  },
  subtitle: { 
    content: "Anh/ chị có dự án cần thực hiện:", 
    fontSize: { desktop: 24, tablet: 20, mobile: 18 },
    lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' }
  },
};

export function Contact() {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";
  const [heading, setHeading] = useState<RichTextData>(DEFAULTS.heading);
  const [subtitle, setSubtitle] = useState<RichTextData>(DEFAULTS.subtitle);
  const [phone, setPhone] = useState<ResponsiveValue>("038 429 7019");
  const [email, setEmail] = useState<ResponsiveValue>("chuong.thanh1007@gmail.com");
  const [facebook, setFacebook] = useState<ResponsiveValue>("");
  const [facebookLabel, setFacebookLabel] = useState<ResponsiveValue>("Visit Profile");
  const [showFacebook, setShowFacebook] = useState<ResponsiveValue>(true);
  const [zalo, setZalo] = useState<ResponsiveValue>("");
  const [zaloLabel, setZaloLabel] = useState<ResponsiveValue>("Chat on Zalo");
  const [showZalo, setShowZalo] = useState<ResponsiveValue>(true);
  const [showPhone, setShowPhone] = useState<ResponsiveValue>(true);
  const [showEmail, setShowEmail] = useState<ResponsiveValue>(true);
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("128");
  const [isVisible, setIsVisible] = useState(true);
  const { isAdmin, globalPreviewMode } = useAdmin();
  const isEditor = isAdmin;

  const normalize = useCallback((val: any, defaultSize: number = 16): RichTextData => {
    if (typeof val === 'object' && val !== null && 'content' in val) return val;
    return { 
      content: val || '', 
      fontSize: { mobile: defaultSize, tablet: defaultSize + 2, desktop: defaultSize + 4 },
      lineHeight: { mobile: '1.4', tablet: '1.4', desktop: '1.4' },
      fontFamily: { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' },
      fontWeight: { mobile: '400', tablet: '400', desktop: '400' },
      textColor: { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' }
    };
  }, []);

  const fetchContent = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "contact")
        .single();

      if (data?.data) {
        const d = data.data as Record<string, any>;
        setHeading(normalize(d.heading, 60));
        setSubtitle(normalize(d.subtitle, 24));
        setPhone(d.phone || "038 429 7019");
        setEmail(d.email || "chuong.thanh1007@gmail.com");
        setFacebook(d.facebook || "");
        setFacebookLabel(d.facebookLabel || "Visit Profile");
        setShowFacebook(d.showFacebook !== false);
        setZalo(d.zalo || "");
        setZaloLabel(d.zaloLabel || "Chat on Zalo");
        setShowZalo(d.showZalo !== false);
        setShowPhone(d.showPhone !== false);
        setShowEmail(d.showEmail !== false);
        if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
        if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
        if (d.isVisible !== undefined) setIsVisible(d.isVisible);
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
    }
  }, [normalize]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const applyUpdate = useCallback((d: any) => {
    if (d.heading !== undefined) setHeading(normalize(d.heading, 60));
    if (d.subtitle !== undefined) setSubtitle(normalize(d.subtitle, 24));
    if (d.phone !== undefined) setPhone(d.phone);
    if (d.email !== undefined) setEmail(d.email);
    if (d.facebook !== undefined) setFacebook(d.facebook);
    if (d.facebookLabel !== undefined) setFacebookLabel(d.facebookLabel);
    if (d.showFacebook !== undefined) setShowFacebook(d.showFacebook);
    if (d.zalo !== undefined) setZalo(d.zalo);
    if (d.zaloLabel !== undefined) setZaloLabel(d.zaloLabel);
    if (d.showZalo !== undefined) setShowZalo(d.showZalo);
    if (d.showPhone !== undefined) setShowPhone(d.showPhone);
    if (d.showEmail !== undefined) setShowEmail(d.showEmail);
    if (d.paddingTop !== undefined) setPaddingTopData(d.paddingTop);
    if (d.paddingBottom !== undefined) setPaddingBottomData(d.paddingBottom);
    if (d.isVisible !== undefined) setIsVisible(d.isVisible);
  }, [normalize]);

  // Real-time updates
  useEffect(() => {
    const handlePreviewUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.sectionId === 'contact') {
        applyUpdate(customEvent.detail.data);
      }
    };

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_UPDATE' && event.data.sectionId === 'contact') {
        applyUpdate(event.data.data);
      }
    };

    window.addEventListener('previewUpdate', handlePreviewUpdate);
    window.addEventListener('message', handleParentMessage);
    
    return () => {
      window.removeEventListener('previewUpdate', handlePreviewUpdate);
      window.removeEventListener('message', handleParentMessage);
    };
  }, [applyUpdate]);

  if (pathname === '/admin/builder') return null;
  if (!isVisible && !isAdmin) return null;

  return (
    <SectionEditor
      sectionId="contact"
      initialData={{ heading, subtitle, phone, email, facebook, facebookLabel, showFacebook, zalo, zaloLabel, showZalo, showPhone, showEmail, isVisible, paddingTop: paddingTopData, paddingBottom: paddingBottomData }}
      onSave={fetchContent}
      isVisible={isVisible}
    >
      
      <style dangerouslySetInnerHTML={{ __html: `
        .contact-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          padding-bottom: var(--pb-mob);
          padding-left: 16px;
          padding-right: 16px;
        }
        .contact-heading:not(.is-editor) {
          font-size: var(--h-fs-mob);
          line-height: var(--h-lh-mob);
          font-family: var(--h-ff-mob);
          font-weight: var(--h-fw-mob);
        }
        .contact-subheading:not(.is-editor) {
          font-size: var(--s-fs-mob);
          line-height: var(--s-lh-mob);
        }
        .contact-grid:not(.is-editor) {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        @media (min-width: 768px) {
          .contact-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            padding-bottom: var(--pb-tab);
            padding-left: 48px;
            padding-right: 48px;
          }
          .contact-heading:not(.is-editor) {
            font-size: var(--h-fs-tab);
            line-height: var(--h-lh-tab);
            font-family: var(--h-ff-tab);
            font-weight: var(--h-fw-tab);
          }
          .contact-subheading:not(.is-editor) {
            font-size: var(--s-fs-tab);
            line-height: var(--s-lh-tab);
          }
          .contact-grid:not(.is-editor) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .contact-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            padding-bottom: var(--pb-desk);
          }
          .contact-heading:not(.is-editor) {
            font-size: var(--h-fs-desk);
            line-height: var(--h-lh-desk);
            font-family: var(--h-ff-desk);
            font-weight: var(--h-fw-desk);
          }
          .contact-subheading:not(.is-editor) {
            font-size: var(--s-fs-desk);
            line-height: var(--s-lh-desk);
          }
        }
      `}} />

      <section id="contact" 
        className={cn(
          "contact-container bg-[var(--bg-base)]",
          !isEditor && "not-is-editor",
          isEditor && "is-editor",
          isEditor && globalPreviewMode === 'mobile' && "px-4",
          isEditor && globalPreviewMode === 'tablet' && "px-8",
          isEditor && globalPreviewMode === 'desktop' && "px-12",
          isContactPage ? "flex flex-col" : "border-t border-[var(--border-subtle)]"
        )}
        style={{
          "--pt-desk": `${getResponsiveValue(paddingTopData, 'desktop') || 0}px`,
          "--pt-tab": `${getResponsiveValue(paddingTopData, 'tablet') || 0}px`,
          "--pt-mob": `${getResponsiveValue(paddingTopData, 'mobile') || 0}px`,
          "--pb-desk": `${getResponsiveValue(paddingBottomData, 'desktop') || 0}px`,
          "--pb-tab": `${getResponsiveValue(paddingBottomData, 'tablet') || 0}px`,
          "--pb-mob": `${getResponsiveValue(paddingBottomData, 'mobile') || 0}px`,
          ...(isEditor ? {
             paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px`,
             paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 0}px`
          } : {})
        } as any}
      >
        <div className="max-w-4xl mx-auto relative w-full">
          {/* Separator Line only for Contact Page */}
          {isContactPage && (
            <div className="absolute top-[-5rem] left-0 right-0 h-px bg-[var(--bg-elevated)]" />
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={cn("flex flex-col", isContactPage ? "gap-4" : "gap-6")}
          >
            <div className="flex flex-col gap-2 md:gap-3">
              {heading && (
                <div 
                  className={cn("contact-heading tracking-tighter text-[var(--text-primary)] whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}
                  style={{
                    fontSize: isEditor ? `${heading.fontSize?.[globalPreviewMode || 'desktop'] || 80}px` : undefined,
                    lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                    fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                    fontWeight: isEditor ? (heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                    "--h-fs-desk": `${heading.fontSize?.desktop || 80}px`,
                    "--h-fs-tab": `${heading.fontSize?.tablet || 48}px`,
                    "--h-fs-mob": `${heading.fontSize?.mobile || 32}px`,
                    "--h-lh-desk": heading.lineHeight?.desktop || '1.1',
                    "--h-lh-tab": heading.lineHeight?.tablet || '1.1',
                    "--h-lh-mob": heading.lineHeight?.mobile || '1.1',
                    "--h-ff-desk": heading.fontFamily?.desktop || 'inherit',
                    "--h-ff-tab": heading.fontFamily?.tablet || 'inherit',
                    "--h-ff-mob": heading.fontFamily?.mobile || 'inherit',
                    "--h-fw-desk": heading.fontWeight?.desktop || '700',
                    "--h-fw-tab": heading.fontWeight?.tablet || '700',
                    "--h-fw-mob": heading.fontWeight?.mobile || '700',
                    "--h-color-desk": getSafeColor(heading.textColor?.desktop) === 'inherit' ? undefined : getSafeColor(heading.textColor?.desktop),
                    "--h-color-tab": getSafeColor(heading.textColor?.tablet) === 'inherit' ? undefined : getSafeColor(heading.textColor?.tablet),
                    "--h-color-mob": getSafeColor(heading.textColor?.mobile) === 'inherit' ? undefined : getSafeColor(heading.textColor?.mobile),
                    color: globalPreviewMode === 'mobile' ? 'var(--h-color-mob)' : globalPreviewMode === 'tablet' ? 'var(--h-color-tab)' : 'var(--h-color-desk)'
                  } as any}
                  dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(heading.content, globalPreviewMode || 'desktop') || "") }}
                />
              )}
              {subtitle && (
                <div 
                  className={cn("contact-subheading text-[var(--text-muted)] whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}
                  style={{
                    fontSize: isEditor ? `${subtitle.fontSize?.[globalPreviewMode || 'desktop'] || 24}px` : undefined,
                    lineHeight: isEditor ? (subtitle.lineHeight?.[globalPreviewMode || 'desktop'] || '1.4') : undefined,
                    "--s-fs-desk": `${subtitle.fontSize?.desktop || 24}px`,
                    "--s-fs-tab": `${subtitle.fontSize?.tablet || 20}px`,
                    "--s-fs-mob": `${subtitle.fontSize?.mobile || 18}px`,
                    "--s-lh-desk": subtitle.lineHeight?.desktop || '1.4',
                    "--s-lh-tab": subtitle.lineHeight?.tablet || '1.4',
                    "--s-lh-mob": subtitle.lineHeight?.mobile || '1.4',
                    "--s-color-desk": getSafeColor(subtitle.textColor?.desktop) === 'inherit' ? undefined : getSafeColor(subtitle.textColor?.desktop),
                    "--s-color-tab": getSafeColor(subtitle.textColor?.tablet) === 'inherit' ? undefined : getSafeColor(subtitle.textColor?.tablet),
                    "--s-color-mob": getSafeColor(subtitle.textColor?.mobile) === 'inherit' ? undefined : getSafeColor(subtitle.textColor?.mobile),
                    color: globalPreviewMode === 'mobile' ? 'var(--s-color-mob)' : globalPreviewMode === 'tablet' ? 'var(--s-color-tab)' : 'var(--s-color-desk)'
                  } as any}
                  dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(subtitle.content, globalPreviewMode || 'desktop') || "") }}
                />
              )}
            </div>

            <div className={cn("contact-grid w-full mt-4 gap-4 md:gap-8 grid", !isEditor && "not-is-editor", isEditor && "is-editor", !isAdmin ? "grid-cols-1 md:grid-cols-2" : (globalPreviewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'))}>
              {getResponsiveValue(showPhone, globalPreviewMode) !== false && (
                <a
                  href={`tel:${(getResponsiveValue(phone, globalPreviewMode) || '').toString().replace(/\s/g, '')}`}
                  className="flex items-center gap-4 group p-4 md:p-6 border border-[var(--border-default)] rounded-2xl hover:bg-[var(--bg-surface)] transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-red-500/10 transition-colors shrink-0">
                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-[var(--text-secondary)] group-hover:text-red-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-[var(--text-muted)] mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Phone Number</span>
                    <span className="text-base md:text-xl font-medium text-[var(--text-secondary)] block truncate">{getResponsiveValue(phone, globalPreviewMode)}</span>
                  </div>
                </a>
              )}

              {getResponsiveValue(showEmail, globalPreviewMode) !== false && (
                <a
                  href={`mailto:${getResponsiveValue(email, globalPreviewMode)}`}
                  className="flex items-center gap-4 group p-4 md:p-6 border border-[var(--border-default)] rounded-2xl hover:bg-[var(--bg-surface)] transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-orange-500/10 transition-colors shrink-0">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-[var(--text-secondary)] group-hover:text-orange-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-[var(--text-muted)] mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Email Address</span>
                    <span className="text-base md:text-xl font-medium text-[var(--text-secondary)] block break-all leading-tight">{getResponsiveValue(email, globalPreviewMode)}</span>
                  </div>
                </a>
              )}

              {/* Conditional Facebook */}
              {getResponsiveValue(facebook, globalPreviewMode) && getResponsiveValue(showFacebook, globalPreviewMode) !== false && (
                <a
                  href={getResponsiveValue(facebook, globalPreviewMode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-4 md:p-6 border border-[var(--border-default)] rounded-2xl hover:bg-[var(--bg-surface)] transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-blue-600/10 transition-colors shrink-0">
                    <Facebook className="w-5 h-5 md:w-6 md:h-6 text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-[var(--text-muted)] mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Facebook</span>
                    <span className="text-base md:text-xl font-medium text-[var(--text-secondary)] block truncate">{getResponsiveValue(facebookLabel, globalPreviewMode)}</span>
                  </div>
                </a>
              )}

              {/* Conditional Zalo */}
              {getResponsiveValue(zalo, globalPreviewMode) && getResponsiveValue(showZalo, globalPreviewMode) !== false && (
                <a
                  href={typeof getResponsiveValue(zalo, globalPreviewMode) === 'string' && getResponsiveValue(zalo, globalPreviewMode).startsWith('http') ? getResponsiveValue(zalo, globalPreviewMode) : `https://zalo.me/${(getResponsiveValue(zalo, globalPreviewMode) || '').toString().replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-4 md:p-6 border border-[var(--border-default)] rounded-2xl hover:bg-[var(--bg-surface)] transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-blue-500/10 transition-colors shrink-0">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[var(--text-secondary)] group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-[var(--text-muted)] mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Zalo</span>
                    <span className="text-base md:text-xl font-medium text-[var(--text-secondary)] block truncate">{getResponsiveValue(zaloLabel, globalPreviewMode)}</span>
                  </div>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </SectionEditor>
  );
}
