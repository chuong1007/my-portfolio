"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getResponsiveValue } from "@/lib/responsive-helpers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoConfig, setLogoConfig] = useState<{ type: 'text' | 'image', text: any, url: any, color?: any }>({
    type: 'text',
    text: 'CHUONG.GRAPHIC',
    url: '',
    color: '#FFFFFF'
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    supabase.from('site_content').select('id, data').then(({ data }) => {
      if (data) {
        const heroRow = data.find(row => row.id === 'hero');
        if (heroRow?.data) {
          const hd = heroRow.data as any;
          setLogoConfig({
            type: hd.logoType || 'text',
            text: hd.logoText || 'CHUONG.GRAPHIC',
            url: hd.logoImageUrl || '',
            color: hd.logoColor || '#FFFFFF'
          });
        }
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const logoRaw = getResponsiveValue(logoConfig.text, 'desktop');
  const currentLogoText = typeof logoRaw === 'object' && logoRaw !== null
    ? (logoRaw.content || logoRaw.text || JSON.stringify(logoRaw))
    : logoRaw;

  const currentLogoColor = getResponsiveValue(logoConfig.color, 'desktop') || '#FFFFFF';
  const currentLogoUrl = getResponsiveValue(logoConfig.url, 'desktop');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center group">
              {logoConfig.type === 'text' ? (
                <span
                  className="text-lg font-bold tracking-wider"
                  style={{ color: currentLogoColor }}
                >
                  {currentLogoText}
                </span>
              ) : (
                <img
                  src={currentLogoUrl}
                  alt="Logo"
                  className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const span = document.createElement('span');
                      span.className = "text-lg font-bold tracking-wider";
                      span.style.color = currentLogoColor;
                      span.innerText = currentLogoText;
                      parent.appendChild(span);
                    }
                  }}
                />
              )}
            </a>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg font-medium">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 hidden md:block">{user.email}</span>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="text-sm text-zinc-400 hover:text-zinc-50 border border-zinc-800 px-4 py-2 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className={cn(
        "mx-auto",
        pathname === "/admin/builder" ? "max-w-none w-full p-0" : "max-w-7xl px-6 py-10"
      )}>
        {children}
      </main>
    </div>
  );
}
