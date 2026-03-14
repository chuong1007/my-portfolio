import { Hero } from "@/components/Hero";
import { Gallery } from "@/components/Gallery";
import { About } from "@/components/About";
import { Blog } from "@/components/Blog";

export default function Home() {
  return (
    <>
      <Hero />
      <Gallery />
      <About />
      <Blog variant="homepage" />
    </>
  );
}

