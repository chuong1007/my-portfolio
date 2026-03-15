export type DbProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  cover_image: string;
  is_visible: boolean;
  created_at: string;
};

export type DbProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
};

export type DbBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  image_url: string;
  featured: boolean;
  is_published?: boolean;
  custom_css?: string;
  custom_html?: string;
  created_at: string;
};

export type SiteContent = {
  id: string;
  data: Record<string, unknown>;
  updated_at: string;
};
