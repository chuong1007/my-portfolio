"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { LoginModal } from "@/components/admin/LoginModal";

import { createClient } from "@/lib/supabase";



import { useAdmin } from "@/context/AdminContext";
import { Eye, EyeOff, LogOut, Edit2 } from "lucide-react";

const STATIC_NAV_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const { isAdmin, isEditMode, toggleEditMode } = useAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dynamicNavItems, setDynamicNavItems] = useState<{ label: string, href: string }[]>([]);
  const [logoConfig, setLogoConfig] = useState<{ type: 'text' | 'image', text: string, url: string, color?: string }>({
    type: 'text',
    text: 'CHUONG.GRAPHIC',
    url: '',
    color: '#FFFFFF'
  });

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload(); // Reload to clear state
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const supabase = createClient();
      
      // Fetch Logo and Site Config
      const { data: contentData } = await supabase.from('site_content').select('id, data');
      if (contentData) {
        // Logo config from hero
        const heroRow = contentData.find(row => row.id === 'hero');
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

      // Fetch Dynamic Pages for Header
      const { data: pagesData } = await supabase
        .from('pages')
        .select('title, slug')
        .eq('is_published', true)
        .eq('show_in_header', true)
        .order('created_at', { ascending: true });

      if (pagesData) {
        setDynamicNavItems(pagesData.map(p => ({
          label: p.title,
          href: p.slug === 'home' || p.slug === '/' ? '/' : `/${p.slug.replace(/^\//, '')}`
        })));
      } else {
        // Fallback or default items if none found
        setDynamicNavItems([
          { label: "Dự án", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Người mới", href: "/home-2" }
        ]);
      }
    };
    fetchConfig();

    window.addEventListener('contentUpdated', fetchConfig);
    return () => window.removeEventListener('contentUpdated', fetchConfig);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove special hiding for home-2 to allow guest mode
  // if (pathname === '/home-2') return null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300",
          scrolled ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900" : "bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center group">
          {logoConfig.type === 'text' ? (
            <span 
              className="text-xl md:text-2xl font-bold tracking-wider"
              style={{ color: logoConfig.color || '#FFFFFF', fontFamily: 'monospace' }}
            >
              {logoConfig.text}
            </span>
          ) : (
            <img 
              src={logoConfig.url} 
              alt="Logo" 
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to text if image fails
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.className = "text-xl md:text-2xl font-bold tracking-wider";
                  span.style.color = logoConfig.color || '#FFFFFF';
                  span.style.fontFamily = 'monospace';
                  span.innerText = logoConfig.text;
                  parent.appendChild(span);
                }
              }}
            />
          )}
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {isAdmin && (
              <button
                onClick={toggleEditMode}
                className={cn(
                  "flex items-center justify-center gap-2 w-[140px] py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border active:scale-95",
                  isEditMode 
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 hover:bg-blue-500" 
                    : "bg-transparent text-green-400 border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                )}
                title={isEditMode ? "Đang ở chế độ chỉnh sửa" : "Đang ở chế độ xem"}
              >
                {isEditMode ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {isEditMode ? "Admin Mode" : "Preview Mode"}
              </button>
            )}

            {isAdmin && isEditMode && (
              <Link
                href="/admin/blogs"
                className={cn(
                  "transition-all text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20",
                  pathname === "/admin/blogs" && "bg-emerald-500/20 text-emerald-300"
                )}
              >
                Quản lý Blog
              </Link>
            )}

            {isAdmin && isEditMode && (
              <Link
                href="/admin/pages"
                className={cn(
                  "transition-all text-sm font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20",
                  pathname === "/admin/pages" && "bg-blue-500/20 text-blue-300"
                )}
              >
                Quản lý Trang
              </Link>
            )}

            {[...STATIC_NAV_ITEMS, ...dynamicNavItems]
              .filter((item, index, self) => 
                index === self.findIndex((t) => t.href === item.href)
              )
              .map((item) => {
                const isActive = pathname === item.href || 
                                 pathname.startsWith(item.href + '/') || 
                                 (item.href === '/projects' && pathname.startsWith('/project/'));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "transition-colors text-sm font-medium uppercase tracking-widest",
                      isActive ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-50"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          {isAdmin && isEditMode ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
              aria-label="Admin Logout"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-zinc-400 hover:text-red-400" />
            </button>
          ) : !isAdmin && (
            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center justify-center w-10 h-10 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
              aria-label="Admin Login"
              title="Đăng nhập Admin"
            >
              <User className="w-5 h-5 text-zinc-400" />
            </button>
          )}
        </div>
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

