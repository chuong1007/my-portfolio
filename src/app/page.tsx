import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { GlobalPopup } from "@/components/GlobalPopup";
import { PageRenderer } from "@/components/builder/PageRenderer";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: siteContent },
    { data: dbProjects },
    { data: dbBlogs }
  ] = await Promise.all([
    supabase.from('site_content').select('*'),
    supabase.from('projects')
      .select('*')
      .eq('is_visible', true)
      .order('is_featured', { ascending: false })
      .order('featured_order', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(12),
    supabase.from('blogs').select('*').order('created_at', { ascending: false })
  ]);

  const contentMap = siteContent?.reduce((acc: any, item: any) => ({ ...acc, [item.id]: item.data }), {}) || {};

  return (
    <main className="min-h-screen w-full">
      <GlobalPopup isVisible={contentMap['popup']?.isVisible === true} rawContent={contentMap['popup']} />
      <Hero initialContent={contentMap['hero']} initialProjects={dbProjects || undefined} customCarouselImages={contentMap['hero_carousel']?.images || undefined} tiltDirection={contentMap['hero_carousel']?.tiltDirection || 'inward'} carouselGap={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.gap ?? contentMap['hero_carousel']?.gap} carouselPerspective={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.perspective ?? contentMap['hero_carousel']?.perspective} dTheta={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.dTheta ?? contentMap['hero_carousel']?.dTheta} w_card={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.wCard ?? contentMap['hero_carousel']?.w_card} blurStrength={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.blurStrength ?? contentMap['hero_carousel']?.blurStrength} dimStrength={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.dimStrength ?? contentMap['hero_carousel']?.dimStrength} displayCount={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.displayCount ?? contentMap['hero_carousel']?.displayCount} />
      <About initialContent={contentMap['about']} />
      <Gallery initialContent={contentMap['gallery']} initialProjects={dbProjects || undefined} />
      <Blog variant="homepage" initialContent={contentMap['blog']} initialBlogs={dbBlogs || undefined} />
    </main>
  );
}
