"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { LoginModal } from "@/components/admin/LoginModal";

import { createClient } from "@/lib/supabase";



import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, type ResponsiveValue } from "@/lib/responsive-helpers";
import { Eye, EyeOff, LogOut, Edit2, Settings, Briefcase, FileText, Layout, Monitor, Tablet, Smartphone, Menu, X } from "lucide-react";

const STATIC_NAV_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const { isAdmin, isEditMode, toggleEditMode, globalPreviewMode, setGlobalPreviewMode } = useAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dynamicNavItems, setDynamicNavItems] = useState<{ label: string, href: string }[]>([]);
  const [logoConfig, setLogoConfig] = useState<{ type: 'text' | 'image', text: ResponsiveValue, url: ResponsiveValue, color?: ResponsiveValue }>({
    type: 'text',
    text: 'CHUONG.GRAPHIC',
    url: '',
    color: '#FFFFFF'
  });
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        const heroRow = contentData.find(row => row?.id === 'hero');
        if (heroRow?.data) {
          const hd = heroRow.data as any;
          setLogoConfig({
            type: hd?.logoType || 'text',
            text: hd?.logoText || 'CHUONG.GRAPHIC',
            url: hd?.logoImageUrl || '',
            color: hd?.logoColor || '#FFFFFF'
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
          label: p?.title || 'Trang',
          href: p?.slug === 'home' || p?.slug === '/' ? '/' : `/${(p?.slug || '').replace(/^\//, '')}`
        })));
      } else {
        // Fallback or default items if none found
        setDynamicNavItems([
          { label: "Dự án", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Thiết kế", href: "/admin/builder" }
        ]);
      }
    };
    fetchConfig();

    window.addEventListener('contentUpdated', fetchConfig);

    // Real-time Preview Listener
    const handlePreviewUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.sectionId === 'hero') {
        const d = customEvent.detail.data;
        if (d.logoType !== undefined || d.logoText !== undefined || d.logoColor !== undefined || d.logoImageUrl !== undefined) {
          setLogoConfig({
            type: d.logoType || 'text',
            text: d.logoText || 'CHUONG.GRAPHIC',
            url: d.logoImageUrl || '',
            color: d.logoColor || '#FFFFFF'
          });
        }
      }
    };

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_UPDATE' && event.data.sectionId === 'hero') {
        const d = event.data.data;
        setLogoConfig({
          type: d.logoType || 'text',
          text: d.logoText || 'CHUONG.GRAPHIC',
          url: d.logoImageUrl || '',
          color: d.logoColor || '#FFFFFF'
        });
      }
    };

    window.addEventListener('previewUpdate', handlePreviewUpdate);
    window.addEventListener('message', handleParentMessage);

    return () => {
      window.removeEventListener('contentUpdated', fetchConfig);
      window.removeEventListener('previewUpdate', handlePreviewUpdate);
      window.removeEventListener('message', handleParentMessage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuOpen && !(event.target as Element).closest('.admin-menu-container')) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove special hiding for home-2 to allow guest mode
  // if (pathname === '/admin/builder') return null;

  return (
    <>
      <header
        className={cn(
          isAdmin && globalPreviewMode !== "desktop" ? "sticky" : "fixed",
          "top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 lg:px-12 transition-all duration-300",
          (scrolled || globalPreviewMode !== 'desktop') ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900" : "bg-transparent lg:bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center group">
          {logoConfig.type === 'text' ? (
            <span
             className={cn(
                "font-bold tracking-wider",
                "text-lg md:text-xl lg:text-2xl"
              )}
              style={{ color: getResponsiveValue(logoConfig.color, globalPreviewMode ?? 'desktop') || '#FFFFFF', fontFamily: 'monospace' }}
            >
              {getResponsiveValue(logoConfig.text, globalPreviewMode ?? 'desktop')}
            </span>
          ) : (
            <img
              src={getResponsiveValue<string>(logoConfig.url, globalPreviewMode ?? 'desktop') || "/logo.png"}
              alt="Logo"
              className={cn(
                "w-auto object-contain transition-transform duration-300 group-hover:scale-105",
                (isAdmin && globalPreviewMode !== 'desktop') || globalPreviewMode === 'mobile' ? "h-6 md:h-7" : "h-7 md:h-10"
              )}
              onError={(e) => {
                // Fallback to text if image fails
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.className = "text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-50 leading-[1.1] text-balance mx-auto whitespace-pre-line";
                  span.style.color = (getResponsiveValue(logoConfig.color, globalPreviewMode ?? 'desktop') as string) || '#FFFFFF';
                  span.style.fontFamily = 'monospace';
                  const textVal = getResponsiveValue(logoConfig.text, globalPreviewMode ?? 'desktop');
                  span.innerText = typeof textVal === 'string' ? textVal : '';
                  parent.appendChild(span);
                }
              }}
            />
          )}
        </Link>

        <div className="flex items-center gap-6">
          <nav className={cn(
            "items-center gap-6",
            isAdmin && globalPreviewMode !== 'desktop' ? "hidden" : "hidden lg:flex"
          )}>
            {isAdmin && (
              <button
                onClick={toggleEditMode}
                className={cn(
                  "flex items-center justify-center gap-2 w-[110px] py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border active:scale-95",
                  isEditMode
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 hover:bg-blue-500"
                    : "bg-transparent text-green-400 border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                )}
                title={isEditMode ? "Đang ở chế độ chỉnh sửa" : "Đang ở chế độ xem"}
              >
                {isEditMode ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {isEditMode ? "Admin" : "Preview"}
              </button>
            )}

            {/* Global Responsive Preview Toggle - Admin Only */}
            {isAdmin && (
              <div className="flex bg-zinc-900/80 rounded-full border border-zinc-800 p-0.5">
                {([
                  { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setGlobalPreviewMode(mode)}
                    className={cn(
                      "p-1.5 rounded-full transition-all duration-200",
                      globalPreviewMode === mode
                        ? "text-blue-500"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                    title={label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}

            {isAdmin && isEditMode && (
              <div className="relative admin-menu-container">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full transition-all border active:scale-95",
                    adminMenuOpen
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 shadow-lg"
                  )}
                  title="Quản lý"
                >
                  <Settings className={cn("w-4 h-4 transition-transform duration-300", adminMenuOpen && "rotate-90")} />
                </button>

                {adminMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-colors"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Briefcase className="w-4 h-4" />
                      Quản lý Dự án
                    </Link>
                    <Link
                      href="/admin/blogs"
                      className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      Quản lý Blog
                    </Link>
                    <Link
                      href="/admin/pages"
                      className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 transition-colors"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Layout className="w-4 h-4" />
                      Quản lý Trang
                    </Link>
                  </div>
                )}
              </div>
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

            {/* Desktop Auth Buttons */}
            {isAdmin && isEditMode ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors ml-4"
                aria-label="Admin Logout"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5 text-zinc-400 hover:text-red-400" />
              </button>
            ) : !isAdmin && (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center justify-center w-10 h-10 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors ml-4"
                aria-label="Admin Login"
                title="Đăng nhập Admin"
              >
                <User className="w-5 h-5 text-zinc-400" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              "flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors",
              (isAdmin && globalPreviewMode !== 'desktop') ? "flex" : (isAdmin ? "hidden lg:flex" : "flex lg:hidden")
            )}
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-md flex flex-col items-center pt-24 pb-10 px-6 animate-in fade-in duration-300">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 flex items-center justify-center w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label="Close Mobile Menu"
          >
            <X className="w-6 h-6" />
          </button>

          <nav className="flex flex-col items-center gap-8 w-full mt-12 overflow-y-auto">
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "transition-colors text-2xl font-bold uppercase tracking-widest",
                      isActive ? "text-emerald-400" : "text-zinc-300 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

            {isAdmin && (
              <div className="flex flex-col items-center gap-6 w-full">
                <button
                  onClick={() => toggleEditMode()}
                  className={cn(
                    "flex items-center justify-center gap-3 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all border",
                    isEditMode
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                      : "bg-transparent text-green-400 border-green-400/50"
                  )}
                >
                  {isEditMode ? <Edit2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {isEditMode ? "Admin Mode: ON" : "Edit Mode: OFF"}
                </button>

                <div className="flex bg-zinc-900/80 rounded-full border border-zinc-800 p-1">
                  {([
                    { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                    { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                    { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                  ]).map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setGlobalPreviewMode(mode);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "p-3 rounded-full transition-all duration-200",
                        globalPreviewMode === mode
                          ? "text-blue-500 bg-blue-500/10"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="w-16 h-px bg-zinc-800 my-4" />

            {/* Mobile Auth Buttons */}
            {isAdmin ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-6 py-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-full text-sm font-bold uppercase tracking-wider uppercase transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất Admin
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setLoginOpen(true);
                }}
                className="flex items-center justify-center w-12 h-12 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-white text-zinc-500 transition-colors mt-auto"
                title="Đăng nhập Admin"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </nav>
        </div>
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

