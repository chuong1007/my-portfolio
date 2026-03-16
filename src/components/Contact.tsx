"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Facebook, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./SectionEditor";
import { useAdmin } from "@/context/AdminContext";

export function Contact() {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";
  const [heading, setHeading] = useState("Let's Connect");
  const [subtitle, setSubtitle] = useState("Anh/ chị có dự án cần thực hiện:");
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
  const [isVisible, setIsVisible] = useState(true);
  const { isAdmin } = useAdmin();

  const fetchContent = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "contact")
      .single();

    if (data?.data) {
      const d = data.data as Record<string, any>;
      // Guard against responsive objects {mobile, tablet, desktop}
      const safeStr = (val: any, fallback: string) => {
        if (val === null || val === undefined) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          return val.desktop || val.tablet || val.mobile || fallback;
        }
        return String(val);
      };
      setHeading(safeStr(d.heading, "Let's Connect"));
      setSubtitle(safeStr(d.subtitle, "Anh/ chị có dự án cần thực hiện:"));
      setPhone(safeStr(d.phone, "038 429 7019"));
      setEmail(safeStr(d.email, "chuong.thanh1007@gmail.com"));
      setFacebook(safeStr(d.facebook, ""));
      setFacebookLabel(safeStr(d.facebookLabel, "Visit Profile"));
      setShowFacebook(d.showFacebook !== false);
      setZalo(safeStr(d.zalo, ""));
      setZaloLabel(safeStr(d.zaloLabel, "Chat on Zalo"));
      setShowZalo(d.showZalo !== false);
      setShowPhone(d.showPhone !== false);
      setShowEmail(d.showEmail !== false);
      if (d.isVisible !== undefined) setIsVisible(d.isVisible);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (pathname === '/admin/builder') return null;
  if (!isVisible && !isAdmin) return null;

  return (
    <SectionEditor
      sectionId="contact"
      initialData={{ heading, subtitle, phone, email, facebook, facebookLabel, showFacebook, zalo, zaloLabel, showZalo, showPhone, showEmail, isVisible }}
      onSave={fetchContent}
      isVisible={isVisible}
    >
      <section 
        id="contact" 
        className={cn(
          "px-6 md:px-12 bg-zinc-950",
          isContactPage ? "pb-32 pt-20" : "py-32 border-t border-zinc-900"
        )}
      >
        <div className="max-w-4xl mx-auto relative">
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
                    "tracking-tighter text-zinc-50 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                    isContactPage ? "[&_h1]:text-3xl [&_h2]:text-2xl" : "[&_h1]:text-6xl [&_h1]:md:text-8xl [&_h2]:text-4xl [&_h2]:md:text-6xl"
                  )}
                  dangerouslySetInnerHTML={{ __html: typeof heading === 'string' ? heading : String(heading) }}
                />
              )}
              {subtitle && (
                <div 
                  className={cn(
                    "text-zinc-400 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0",
                    isContactPage ? "text-base md:text-lg" : "text-xl md:text-2xl"
                  )}
                  dangerouslySetInnerHTML={{ __html: typeof subtitle === 'string' ? subtitle : String(subtitle) }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {showPhone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 group p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                    <Phone className="w-6 h-6 text-zinc-300 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm text-zinc-500 mb-1">Phone Number</span>
                    <span className="text-lg md:text-xl font-medium text-zinc-200 break-all">{phone}</span>
                  </div>
                </a>
              )}

              {showEmail && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 group p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                    <Mail className="w-6 h-6 text-zinc-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm text-zinc-500 mb-1">Email Address</span>
                    <span className="text-lg md:text-xl font-medium text-zinc-200 break-all">{email}</span>
                  </div>
                </a>
              )}

              {/* Conditional Facebook */}
              {facebook && showFacebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                    <Facebook className="w-6 h-6 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm text-zinc-500 mb-1">Facebook</span>
                    <span className="text-lg md:text-xl font-medium text-zinc-200 break-all">{facebookLabel}</span>
                  </div>
                </a>
              )}

              {/* Conditional Zalo */}
              {zalo && showZalo && (
                <a
                  href={zalo.startsWith('http') ? zalo : `https://zalo.me/${zalo.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-6 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                    <MessageSquare className="w-6 h-6 text-zinc-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm text-zinc-500 mb-1">Zalo</span>
                    <span className="text-lg md:text-xl font-medium text-zinc-200 break-all">{zaloLabel}</span>
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
