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
import ChatbotGate from "@/components/AIChatbot/ChatbotGate";

function GlobalPreviewContent({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBuilder = pathname === "/admin/builder";
  const isAdminPage = pathname.startsWith("/admin");
  const isComingSoon = pathname === "/coming-soon";
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
        {!isAdminPage && !isComingSoon && <ChatbotGate />}
      </div>
    );
  }

  const isPreviewActive = isAdmin && globalPreviewMode !== "desktop";

  return (
    <>
      {!isPreviewActive && !isAdminPage && !isComingSoon && <Header />}

      {isPreviewActive ? (
        // Device Frame Container
        <div className="fixed inset-0 z-40 bg-[var(--bg-base)] overflow-hidden">
          {/* Dark overlay behind device */}
          <div className="absolute inset-0 bg-[var(--bg-base)]" />

          {/* Floating Admin Controls OUTSIDE the simulator frame */}
          <div className="fixed top-6 left-6 md:left-[calc(50%+220px)] lg:left-[calc(50%+240px)] xl:left-[calc(50%+300px)] z-[2000] flex flex-col items-start gap-4" style={{ transform: "translateX(20px)" }}>
            
            {/* Admin Mode Toggle */}
            <button
              onClick={() => toggleEditMode()}
              className={cn(
                "flex items-center justify-center gap-3 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xl backdrop-blur-md border",
                isEditMode
                  ? "bg-blue-600/90 text-white border-blue-500/50 shadow-blue-500/20"
                  : "bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10"
              )}
            >
              {isEditMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditMode ? "Admin Mode: ON" : "Edit Mode: OFF"}
            </button>

            {/* Device Toggles */}
            <div className="flex bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-800 p-1 shadow-xl">
              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setGlobalPreviewMode(mode)}
                  className={cn(
                    "p-2.5 rounded-full transition-all duration-200",
                    globalPreviewMode === mode
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Device Frame */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 z-10 transition-all duration-500 ease-in-out flex flex-col overflow-hidden",
              "border-[12px] border-[var(--border-default)] rounded-[3rem] shadow-2xl shadow-black/80 bg-[var(--bg-base)] -translate-x-1/2 -translate-y-1/2",
              globalPreviewMode === 'mobile' ? "w-[375px] h-[812px] scale-[0.85]" : "w-[768px] h-[1024px] scale-[0.65]"
            )}
          >
            {/* Device Notch */}
            <div className="h-6 w-full bg-[var(--border-default)] flex items-center justify-center shrink-0">
              <div className="w-20 h-1.5 bg-[var(--bg-surface)] rounded-full" />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--bg-base)] relative">
              {!isAdminPage && !isComingSoon && <Header />}
              <main className="min-h-full">
                {children}
              </main>
              {!isAdminPage && !isComingSoon && <Contact />}
              {!isAdminPage && !isComingSoon && <ChatbotGate />}
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
          {!isAdminPage && !isComingSoon && <Contact />}
          {!isAdminPage && !isComingSoon && <ChatbotGate />}
          {!isBuilder && !isComingSoon && <AdminEditButton />}
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
