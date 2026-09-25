import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { GlobalPopup } from "@/components/GlobalPopup";
import { PageRenderer } from "@/components/builder/PageRenderer";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic'

// Timeout wrapper: if Supabase is slow / network is down, don't block SSR
function withTimeout<T>(promise: Promise<T> | PromiseLike<T>, ms = 5000): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
  ])
}

export default async function Home() {
  const supabase = await createClient()

  let siteContent: any[] | null = null
  let dbProjects: any[] | null = null
  let dbBlogs: any[] | null = null

  try {
    const [contentResult, projectsResult, blogsResult] = await Promise.all([
      withTimeout(supabase.from('site_content').select('*')),
      withTimeout(
        supabase
          .from('projects')
          .select('*')
          .eq('is_visible', true)
          .order('is_featured', { ascending: false })
          .order('featured_order', { ascending: true })
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(12)
      ),
      withTimeout(supabase.from('blogs').select('*').order('created_at', { ascending: false }))
    ])
    siteContent = (contentResult as any)?.data ?? null
    dbProjects = (projectsResult as any)?.data ?? null
    dbBlogs = (blogsResult as any)?.data ?? null
  } catch (err) {
    console.error('Home page data fetch error:', err)
  }

  const contentMap = siteContent?.reduce((acc: any, item: any) => ({ ...acc, [item.id]: item.data }), {}) || {};

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Person", "ProfessionalService"],
    "name": "Trần Thanh Chương",
    "jobTitle": "Visual Graphic Designer & Brand Identity Specialist",
    "url": "https://chuong-graphic.vercel.app",
    "image": "https://chuong-graphic.vercel.app/og-image.png",
    "description": "Visual Graphic Designer với 7 năm kinh nghiệm tại TP.HCM. Chuyên thiết kế nhận diện thương hiệu, ấn phẩm đồ hoạ, quảng cáo đa nền tảng và thiết kế bao bì.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hồ Chí Minh",
      "addressRegion": "Hồ Chí Minh",
      "addressCountry": "VN"
    }
  };

  return (
    <main className="min-h-screen w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GlobalPopup isVisible={contentMap['popup']?.isVisible === true} rawContent={contentMap['popup']} />
      <Hero initialContent={contentMap['hero']} initialProjects={dbProjects || undefined} customCarouselImages={contentMap['hero_carousel']?.images || undefined} tiltDirection={contentMap['hero_carousel']?.tiltDirection || 'inward'} carouselGap={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.gap ?? contentMap['hero_carousel']?.gap} carouselPerspective={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.perspective ?? contentMap['hero_carousel']?.perspective} dTheta={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.dTheta ?? contentMap['hero_carousel']?.dTheta} w_card={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.wCard ?? contentMap['hero_carousel']?.w_card} blurStrength={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.blurStrength ?? contentMap['hero_carousel']?.blurStrength} dimStrength={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.dimStrength ?? contentMap['hero_carousel']?.dimStrength} displayCount={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.displayCount ?? contentMap['hero_carousel']?.displayCount} yOffsetMobile={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.yOffsetMobile ?? contentMap['hero_carousel']?.yOffsetMobile} yOffsetTablet={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.yOffsetTablet ?? contentMap['hero_carousel']?.yOffsetTablet} yOffsetDesktop={contentMap['hero_carousel']?.configs?.[contentMap['hero_carousel']?.tiltDirection]?.yOffsetDesktop ?? contentMap['hero_carousel']?.yOffsetDesktop} />
      <About initialContent={contentMap['about']} />
      <Gallery initialContent={contentMap['gallery']} initialProjects={dbProjects || undefined} />
      <Blog variant="homepage" initialContent={contentMap['blog']} initialBlogs={dbBlogs || undefined} />
    </main>
  );
}
