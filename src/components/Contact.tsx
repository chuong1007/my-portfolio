"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Facebook, MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import type { RichTextData } from "./RichTextEditor";

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
  const [phone, setPhone] = useState("038 429 7019");
  const [email, setEmail] = useState("chuong.thanh1007@gmail.com");
  const [facebook, setFacebook] = useState("");
  const [facebookLabel, setFacebookLabel] = useState("Visit Profile");
  const [showFacebook, setShowFacebook] = useState(true);
  const [zalo, setZalo] = useState("");
  const [zaloLabel, setZaloLabel] = useState("Chat on Zalo");
  const [showZalo, setShowZalo] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [paddingTopData, setPaddingTopData] = useState<ResponsiveValue>("0");
  const [paddingBottomData, setPaddingBottomData] = useState<ResponsiveValue>("128");
  const [isVisible, setIsVisible] = useState(true);
  const { isAdmin, globalPreviewMode } = useAdmin();

  const normalize = useCallback((val: any, defaultSize: number = 16): RichTextData => {
    if (typeof val === 'object' && val !== null && 'content' in val) return val;
    return { 
      content: val || '', 
      fontSize: { mobile: defaultSize, tablet: defaultSize + 2, desktop: defaultSize + 4 },
      lineHeight: { mobile: '1.4', tablet: '1.4', desktop: '1.4' }
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
      <section 
        id="contact" 
        className={cn(
          "px-6 md:px-12 bg-zinc-950",
          isContactPage ? "flex flex-col" : "border-t border-zinc-900"
        )}
        style={{
          paddingTop: `${getResponsiveValue(paddingTopData, globalPreviewMode ?? 'desktop') || 0}px`,
          paddingBottom: `${getResponsiveValue(paddingBottomData, globalPreviewMode ?? 'desktop') || 0}px`
        }}
      >
        <div className="max-w-4xl mx-auto relative w-full">
          {/* Separator Line only for Contact Page */}
          {isContactPage && (
            <div className="absolute top-[-5rem] left-0 right-0 h-px bg-zinc-800" />
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
                  className={cn(
                    "tracking-tighter text-zinc-50 whitespace-pre-wrap break-words w-full [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  )}
                  style={{ 
                    fontSize: `${heading.fontSize?.[globalPreviewMode || 'desktop'] || (isContactPage ? 32: 80)}px`,
                    lineHeight: heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1'
                  }}
                  dangerouslySetInnerHTML={{ __html: getResponsiveValue(heading, globalPreviewMode || 'desktop') }}
                />
              )}
              {subtitle && (
                <div 
                  className={cn(
                    "text-zinc-400 whitespace-pre-wrap break-words w-full [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                  )}
                  style={{ 
                    fontSize: `${subtitle.fontSize?.[globalPreviewMode || 'desktop'] || 20}px`,
                    lineHeight: subtitle.lineHeight?.[globalPreviewMode || 'desktop'] || '1.4'
                  }}
                  dangerouslySetInnerHTML={{ __html: getResponsiveValue(subtitle, globalPreviewMode || 'desktop') }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {showPhone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 group p-4 md:p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors shrink-0">
                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-zinc-500 mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Phone Number</span>
                    <span className="text-base md:text-xl font-medium text-zinc-200 break-all">{phone}</span>
                  </div>
                </a>
              )}

              {showEmail && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 group p-4 md:p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors shrink-0">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-zinc-500 mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Email Address</span>
                    <span className="text-base md:text-xl font-medium text-zinc-200 break-all">{email}</span>
                  </div>
                </a>
              )}

              {/* Conditional Facebook */}
              {facebook && showFacebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-4 md:p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors shrink-0">
                    <Facebook className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-zinc-500 mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Facebook</span>
                    <span className="text-base md:text-xl font-medium text-zinc-200 break-all">{facebookLabel}</span>
                  </div>
                </a>
              )}

              {/* Conditional Zalo */}
              {zalo && showZalo && (
                <a
                  href={typeof zalo === 'string' && zalo.startsWith('http') ? zalo : `https://zalo.me/${(zalo || '').toString().replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-4 md:p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors w-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors shrink-0">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] md:text-sm text-zinc-500 mb-0.5 md:mb-1 uppercase tracking-wider font-bold">Zalo</span>
                    <span className="text-base md:text-xl font-medium text-zinc-200 break-all">{zaloLabel}</span>
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
