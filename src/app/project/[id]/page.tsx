import { getProjectById } from "@/lib/data";
import { ProjectDetail } from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Metadata } from "next";

// Always fetch fresh data from Supabase (no stale static cache)
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  try {
    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects")
      .select("title, description, cover_image, tags")
      .eq(isUuid ? "id" : "slug", id)
      .single();

    if (!project) {
      return { title: 'Dự án không tìm thấy' };
    }

    const title = project.title || 'Dự án thiết kế';
    const description = project.description || 'Xem chi tiết dự án thiết kế từ CHUONG.GRAPHIC';

    return {
      title,
      description,
      openGraph: {
        title: `${title} | CHUONG.PORTFOLIO`,
        description,
        images: project.cover_image
          ? [{ url: project.cover_image, width: 1200, height: 630, alt: title }]
          : [{ url: '/og-image.png', width: 1200, height: 630 }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | CHUONG.PORTFOLIO`,
        description,
        images: project.cover_image ? [project.cover_image] : ['/og-image.png'],
      },
    };
  } catch {
    return { title: 'Dự án thiết kế | CHUONG.PORTFOLIO' };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  // Use server-side Supabase client (not browser client)
  const supabase = await createClient();

  const { data: dbProject } = await supabase
    .from("projects")
    .select("*")
    .eq(isUuid ? "id" : "slug", id)
    .single();

  let projectData: any = null;

  if (dbProject) {
    const { data: images } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", dbProject.id)
      .order("display_order", { ascending: true })
      .limit(500); // Explicitly high limit to avoid default 30 cutoff in some environments

    projectData = {
      id: dbProject.id,
      title: dbProject.title,
      description: dbProject.description,
      tags: dbProject.tags,
      imageUrl: dbProject.cover_image,
      gallery_columns: dbProject.gallery_columns || 4,
      gallery_columns_mobile: dbProject.gallery_columns_mobile || 1,
      gallery_columns_tablet: dbProject.gallery_columns_tablet || 2,
      gallery_title: dbProject.gallery_title || "Hình ảnh dự án",
      gallery_bottom_content: dbProject.gallery_bottom_content || "",
      galleryImages: (images || []).map((img: any) => ({
        id: img.id,
        url: img.image_url,
      }))
    };
  } else {
    // Fallback to mock data
    projectData = getProjectById(id);
  }

  if (!projectData) {
    notFound();
  }

  // Fetch other projects for "Related Projects" section
  const { data: relatedProjectsData } = await supabase
    .from("projects")
    .select("id, title, slug, cover_image, tags, is_featured")
    .eq("is_visible", true)
    .neq("id", projectData.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  return <ProjectDetail project={projectData} relatedProjects={relatedProjectsData || []} />;
}
