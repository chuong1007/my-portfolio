import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Blog } from "@/components/Blog";
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
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('blogs').select('*').order('created_at', { ascending: false })
  ]);

  const contentMap = siteContent?.reduce((acc: any, item: any) => ({ ...acc, [item.id]: item.data }), {}) || {};

  return (
    <main className="min-h-screen w-full">
      <Hero initialContent={contentMap['hero']} />
      <About initialContent={contentMap['about']} />
      <Gallery initialContent={contentMap['gallery']} initialProjects={dbProjects || undefined} />
      <Blog variant="homepage" initialContent={contentMap['blog']} initialBlogs={dbBlogs || undefined} />
    </main>
  );
}
