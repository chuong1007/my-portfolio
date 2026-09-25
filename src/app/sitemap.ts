import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';

const BASE_URL = 'https://chuong-graphic.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const supabase = await createClient();

    // Dynamic project pages
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, id, updated_at')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    const projectPages: MetadataRoute.Sitemap = (projects || []).map((project) => ({
      url: `${BASE_URL}/project/${project.slug || project.id}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // Dynamic blog pages
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug, id, updated_at')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    const blogPages: MetadataRoute.Sitemap = (blogs || []).map((blog) => ({
      url: `${BASE_URL}/blog/${blog.slug || blog.id}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...projectPages, ...blogPages];
  } catch {
    // If Supabase is unavailable, return static pages only
    return staticPages;
  }
}
