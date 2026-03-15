"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { AdminEditButton } from "@/components/builder/AdminEditButton";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

const DEVICE_WIDTHS = {
  desktop: "100%",
  tablet: "800px",
  mobile: "400px",
} as const;

const DEVICE_HEIGHTS = {
  desktop: "100%",
  tablet: "1024px",
  mobile: "667px",
} as const;

import { AdminModal } from "@/components/AdminModal";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBuilder = pathname === "/admin/builder";
  const { globalPreviewMode, isAdmin, modalState, closeEditor } = useAdmin();

  // If inside an iframe (loaded via ?iframe=1), render content only
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
        <div className="fixed inset-0 z-40 bg-zinc-950 flex items-start justify-center pt-20 overflow-auto">
          {/* Dark overlay behind device */}
          <div className="absolute inset-0 bg-zinc-950" />
          
          {/* Device Frame */}
          <div
            className={cn(
              "relative z-10 transition-all duration-500 ease-in-out flex flex-col",
              "border-[6px] border-zinc-800 rounded-[2.5rem] shadow-2xl shadow-black/80 overflow-hidden"
            )}
            style={{
              width: DEVICE_WIDTHS[globalPreviewMode],
              height: DEVICE_HEIGHTS[globalPreviewMode],
            }}
          >
            {/* Device Notch */}
            <div className="h-5 w-full bg-zinc-800 flex items-center justify-center shrink-0">
              <div className="w-16 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* iframe loads current page */}
            <iframe
              id="preview-iframe"
              src={`${pathname}?iframe=1&mode=${globalPreviewMode}`}
              className="flex-1 w-full border-none bg-zinc-950"
              title="Responsive Preview"
            />

            {/* Device Bottom Bar */}
            <div className="h-4 w-full bg-zinc-800 flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {!isBuilder && <style>{""}</style>}
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
            // Signal to the iframe to re-fetch data if needed
            const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ type: 'CONTENT_UPDATED' }, '*');
            }
            // Also dispatch locally for non-preview mode
            window.dispatchEvent(new Event('contentUpdated'));
          }}
        />
      )}
    </>
  );
}
