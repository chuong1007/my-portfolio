import { getProjectById, getAllProjects } from "@/lib/data";
import { ProjectDetail } from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Generate static params for all projects to enable static generation
export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase.from('projects').select('id, slug');
  
  const dbParams = (data || []).map((project) => ({
    id: project.slug || project.id,
  }));

  const mockParams = getAllProjects().map((project) => ({
    id: project.id,
  }));

  return [...dbParams, ...mockParams];
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  // Try to fetch from database first
  const supabase = createClient();
  const { data: dbProject } = await supabase
    .from("projects")
    .select("*, images:project_images(*)")
    .eq(isUuid ? "id" : "slug", id)
    .single();

  let projectData: any = null;

  if (dbProject) {
    projectData = {
      id: dbProject.id,
      title: dbProject.title,
      description: dbProject.description,
      tags: dbProject.tags,
      imageUrl: dbProject.cover_image,
      galleryImages: dbProject.images.map((img: any) => ({
        id: img.id,
        url: img.image_url,
      }))
    };
  } else {
    // Fallback to mock data (handling both numeric project-X and UUIDs)
    projectData = getProjectById(id);
  }

  if (!projectData) {
    notFound();
  }

  return <ProjectDetail project={projectData} />;
}
