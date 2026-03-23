export type DbProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  cover_image: string;
  is_visible: boolean;
  is_featured?: boolean;
  featured_order?: number;
  gallery_columns?: number;
  gallery_title?: string;
  gallery_bottom_content?: string;
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
  is_featured: boolean;
  is_published?: boolean;
  custom_css?: string;
  custom_html?: string;
  created_at: string;
};

export type DbTag = {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
};

export type SiteContent = {
  id: string;
  data: Record<string, unknown>;
  updated_at: string;
};
