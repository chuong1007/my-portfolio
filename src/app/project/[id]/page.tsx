import { getProjectById } from "@/lib/data";
import { ProjectDetail } from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Always fetch fresh data from Supabase (no stale static cache)
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  // Use server-side Supabase client (not browser client)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

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

  return <ProjectDetail project={projectData} />;
}
