import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Blog } from "@/components/Blog";
import { GlobalPopup } from "@/components/GlobalPopup";
import { PageRenderer } from "@/components/builder/PageRenderer";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

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
      <GlobalPopup isVisible={contentMap['popup']?.isVisible === true} rawContent={contentMap['popup']?.content} />
      <Hero initialContent={contentMap['hero']} />
      <About initialContent={contentMap['about']} />
      <Gallery initialContent={contentMap['gallery']} initialProjects={dbProjects || undefined} />
      <Blog variant="homepage" initialContent={contentMap['blog']} initialBlogs={dbBlogs || undefined} />
    </main>
  );
}
