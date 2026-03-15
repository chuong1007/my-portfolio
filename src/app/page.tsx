import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Blog } from "@/components/Blog";
import { Contact } from "@/components/Contact";
import { PageRenderer } from "@/components/builder/PageRenderer";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen pt-24 w-full">
      <Hero />
      <About />
      <Gallery />
      <Blog variant="homepage" />
    </main>
  );
}
