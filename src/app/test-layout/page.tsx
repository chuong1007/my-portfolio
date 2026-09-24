import { AboutTest } from "@/components/sections/AboutTest";
import { GalleryTest } from "@/components/sections/GalleryTest";

export const metadata = {
  title: "Test Layout",
  description: "Testing new layouts for About and Gallery",
};

export default function TestLayoutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      {/* Spacer to simulate scrolling down to the section */}
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-4xl font-bold">Cuộn xuống để Test</h1>
      </div>
      
      <AboutTest sectionId="about" />
      
      <GalleryTest sectionId="gallery" />
      
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white border-t border-zinc-900">
        <h1 className="text-4xl font-bold">Cuối trang</h1>
      </div>
    </main>
  );
}
