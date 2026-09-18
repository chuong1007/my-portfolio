"use client";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" suppressHydrationWarning>
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" suppressHydrationWarning />
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50" suppressHydrationWarning>
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 -mx-6 px-6 xl:mx-0 xl:px-0">
            <div className="flex items-center gap-3 shrink-0">
              <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
                ← Về trang chủ
              </a>
              <span className="text-zinc-700">|</span>
              <Link href="/admin" className="text-base font-black text-white tracking-widest hover:text-zinc-300 transition-colors">ADMIN</Link>
            </div>
            
            <div className="w-px h-6 bg-zinc-800 shrink-0 hidden md:block" />

            <div className="flex items-center gap-6 shrink-0">
              
              <Link href="/admin/blogs" className={`text-sm transition-colors ${pathname === '/admin/blogs' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Blog</Link>
              <Link href="/admin/pages" className={`text-sm transition-colors ${pathname === '/admin/pages' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Trang phụ</Link>
              <Link href="/admin/projects" className={`text-sm transition-colors ${pathname === '/admin/projects' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Dự án</Link>
              <Link href="/admin?tab=homepage" className={`text-sm transition-colors ${pathname === '/admin' && tab === 'homepage' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Trang chủ</Link>
              <Link href="/admin?tab=analytics" className={`text-sm transition-colors ${pathname === '/admin' && tab === 'analytics' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Analytics</Link>
              <Link href="/admin?tab=popup" className={`text-sm transition-colors ${pathname === '/admin' && tab === 'popup' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`}>Popup</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 absolute xl:relative top-4 right-6 xl:top-0 xl:right-0">
            <span className="text-sm text-zinc-500 font-medium hidden md:block">{user.email}</span>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 text-sm font-medium"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
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
