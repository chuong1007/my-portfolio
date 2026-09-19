"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Contact } from "@/components/sections/Contact";
import { AdminEditButton } from "@/components/builder/AdminEditButton";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { AdminModal } from "@/components/AdminModal";
import { Edit2, Eye, Monitor, Smartphone, Tablet } from "lucide-react";

function GlobalPreviewContent({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBuilder = pathname === "/admin/builder";
  const isAdminPage = pathname.startsWith("/admin");
  const { globalPreviewMode, setGlobalPreviewMode, isAdmin, isEditMode, toggleEditMode, modalState, closeEditor } = useAdmin();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch: render children only until client is ready
  if (!isMounted) {
    return <>{children}</>;
  }

  // If inside an nested context or certain builder pages that don't need root framing
  const isInsideIframe = searchParams.get("iframe") === "1";
  if (isInsideIframe) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden" suppressHydrationWarning>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Contact />
      </div>
    );
  }

  const isPreviewActive = isAdmin && globalPreviewMode !== "desktop";

  return (
    <>
      {!isPreviewActive && !isAdminPage && <Header />}

      {isPreviewActive ? (
        // Device Frame Container
        <div className="fixed inset-0 z-40 bg-[var(--bg-base)] flex items-start justify-center pt-24 overflow-auto pb-12">
          {/* Dark overlay behind device */}
          <div className="absolute inset-0 bg-[var(--bg-base)]" />

          {/* Floating Admin Controls OUTSIDE the simulator frame */}
          <div className="fixed top-6 left-6 md:left-[calc(50%+220px)] lg:left-[calc(50%+240px)] xl:left-[calc(50%+300px)] z-[2000] flex flex-col items-start gap-4" style={{ transform: "translateX(20px)" }}>
            
            {/* Admin Mode Toggle */}
            <button
              onClick={() => toggleEditMode()}
              className={cn(
                "flex items-center justify-center gap-3 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border",
                isEditMode
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)] hover:text-[var(--text-primary)]"
              )}
            >
              {isEditMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditMode ? "Admin Mode: ON" : "Edit Mode: OFF"}
            </button>
            
            {/* Device Toggle */}
            <div className="flex bg-[var(--bg-elevated)] rounded-full border border-[var(--border-default)] p-1 shadow-lg shadow-black/50">
              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setGlobalPreviewMode(mode)}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200",
                    globalPreviewMode === mode
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                  title={mode}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            
          </div>

          
          {/* Device Frame - Use Div instead of Iframe to prevent crash with {children} */}
          <div
            className={cn(
              "relative z-10 transition-all duration-500 ease-in-out flex flex-col overflow-hidden",
              "border-[12px] border-[var(--border-default)] rounded-[3rem] shadow-2xl shadow-black/80 bg-[var(--bg-base)]",
              globalPreviewMode === 'mobile' ? "w-[375px] h-[812px] scale-[0.85] origin-top" : "w-[768px] h-[1024px] scale-[0.65] origin-top"
            )}
          >
            {/* Device Notch */}
            <div className="h-6 w-full bg-[var(--border-default)] flex items-center justify-center shrink-0">
              <div className="w-20 h-1.5 bg-[var(--bg-surface)] rounded-full" />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--bg-base)] relative">
              {!isAdminPage && <Header />}
              <main className="min-h-full">
                {children}
              </main>
              {!isAdminPage && <Contact />}
            </div>

            {/* Device Bottom Bar */}
            <div className="h-6 w-full bg-zinc-800 flex items-center justify-center shrink-0">
              <div className="w-32 h-1.5 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <main className="flex-grow">
            {children}
          </main>
          {!isAdminPage && <Contact />}
          {!isBuilder && <AdminEditButton />}
        </>
      )}

      {/* GLOBAL ADMIN MODAL - Always rendered outside frames */}
      {modalState && (
        <AdminModal
          isOpen={modalState.isOpen}
          sectionId={modalState.sectionId}
          initialData={modalState.initialData}
          onClose={closeEditor}
          onSave={() => {
            // Re-fetch logic or local events
            window.dispatchEvent(new Event('contentUpdated'));
          }}
        />
      )}
    </>
  );
}

export function GlobalPreviewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GlobalPreviewContent>{children}</GlobalPreviewContent>
    </Suspense>
  );
}
