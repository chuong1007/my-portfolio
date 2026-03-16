"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { AdminEditButton } from "@/components/builder/AdminEditButton";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { AdminModal } from "@/components/AdminModal";

function GlobalPreviewContent({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBuilder = pathname === "/admin/builder";
  const { globalPreviewMode, isAdmin, modalState, closeEditor } = useAdmin();

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
      <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
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
      <Header />

      {isPreviewActive ? (
        // Device Frame Container
        <div className="fixed inset-0 z-40 bg-zinc-950 flex items-start justify-center pt-24 overflow-auto pb-12">
          {/* Dark overlay behind device */}
          <div className="absolute inset-0 bg-zinc-950" />
          
          {/* Device Frame - Use Div instead of Iframe to prevent crash with {children} */}
          <div
            className={cn(
              "relative z-10 transition-all duration-500 ease-in-out flex flex-col",
              "border-[12px] border-zinc-800 rounded-[3rem] shadow-2xl shadow-black/80 bg-zinc-950",
              globalPreviewMode === 'mobile' ? "w-[375px] h-[812px]" : "w-[1024px] h-[768px]"
            )}
          >
            {/* Device Notch */}
            <div className="h-6 w-full bg-zinc-800 flex items-center justify-center shrink-0">
              <div className="w-20 h-1.5 bg-zinc-700 rounded-full" />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
              <main className="min-h-full">
                {children}
              </main>
              {!isBuilder && <Contact />}
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
          {!isBuilder && <Contact />}
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
