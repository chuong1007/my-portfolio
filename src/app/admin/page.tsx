"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Image as ImageIcon, FileText, Save, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getAllProjects } from "@/lib/data";
import type { DbProject, DbProjectImage, DbBlog } from "@/lib/types";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { BlogForm } from "@/components/admin/BlogForm";
import { cn } from "@/lib/utils";

// Convert mock projects to DbProject format for admin display
function getMockProjectsAsDb(): (DbProject & { images: DbProjectImage[]; isMock?: boolean })[] {
  return getAllProjects().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    tags: p.tags,
    cover_image: p.imageUrl,
    is_visible: true,
    created_at: new Date().toISOString(),
    images: p.galleryImages.map((img, idx) => ({
      id: img.id,
      project_id: p.id,
      image_url: img.url,
      display_order: idx,
    })),
    isMock: true,
  }));
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const tabParam = searchParams.get("tab");

  const [projects, setProjects] = useState<(DbProject & { images: DbProjectImage[]; isMock?: boolean })[]>([]);
  const [blogs, setBlogs] = useState<DbBlog[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'projects' | 'blogs' | 'homepage'>(tabParam === 'blogs' ? 'blogs' : tabParam === 'homepage' ? 'homepage' : 'projects');
  
  useEffect(() => {
    if (tabParam === 'blogs') setActiveTab('blogs');
    if (tabParam === 'homepage') setActiveTab('homepage');
  }, [tabParam]);

  // Site content state
  const [heroData, setHeroData] = useState({ title: '', subtitle: '', isVisible: true });
  const [aboutData, setAboutData] = useState({ heading: '', subheading: '', paragraphs: [''], isVisible: true });
  const [contactData, setContactData] = useState({ heading: '', subtitle: '', phone: '', email: '', isVisible: true, showFacebook: true, showZalo: true });
  const [galleryVisible, setGalleryVisible] = useState(true);
  const [blogVisible, setBlogVisible] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<(DbProject & { images: DbProjectImage[] }) | null>(null);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<DbBlog | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    
    // Fetch Projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsData && projectsData.length > 0) {
      const projectsWithImages = await Promise.all(
        projectsData.map(async (project: DbProject) => {
          const { data: images } = await supabase
            .from("project_images")
            .select("*")
            .eq("project_id", project.id)
            .order("display_order", { ascending: true });
          return { ...project, images: images || [] };
        })
      );
      setProjects(projectsWithImages);

      if (editId && tabParam !== 'blogs') {
        const projectToEdit = projectsWithImages.find((p) => p.id === editId);
        if (projectToEdit) setEditingProject(projectToEdit);
      }
    } else {
      // No Supabase projects yet — show mock projects for editing
      const mockProjects = getMockProjectsAsDb();
      setProjects(mockProjects);

      if (editId && tabParam !== 'blogs') {
        const projectToEdit = mockProjects.find((p) => p.id === editId);
        if (projectToEdit) setEditingProject(projectToEdit);
      }
    }

    // Fetch Blogs
    const { data: blogsData } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (blogsData) {
      setBlogs(blogsData);
      
      if (editId && tabParam === 'blogs') {
        const blogToEdit = blogsData.find((b) => b.id === editId);
        if (blogToEdit) {
          setEditingBlog(blogToEdit);
        }
      }
    }

    // Fetch Site Content
    const { data: siteData } = await supabase.from('site_content').select('*');
    if (siteData) {
      for (const row of siteData) {
        const d = row.data as Record<string, unknown>;
        if (row.id === 'hero') setHeroData({ 
          title: (d.title as string) || '', 
          subtitle: (d.subtitle as string) || '',
          isVisible: d.isVisible !== false 
        });
        if (row.id === 'about') setAboutData({ 
          heading: (d.heading as string) || '', 
          subheading: (d.subheading as string) || '', 
          paragraphs: (d.paragraphs as string[]) || [''],
          isVisible: d.isVisible !== false
        });
        if (row.id === 'contact') setContactData({ 
          heading: (d.heading as string) || '', 
          subtitle: (d.subtitle as string) || '',
          phone: (d.phone as string) || '', 
          email: (d.email as string) || '',
          isVisible: d.isVisible !== false,
          showFacebook: d.showFacebook !== false,
          showZalo: d.showZalo !== false
        });
        if (row.id === 'gallery') setGalleryVisible(d.isVisible !== false);
        if (row.id === 'blog') setBlogVisible(d.isVisible !== false);
      }
    }

    setLoading(false);
  }, [editId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleProjectVisibility = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ is_visible: !currentStatus })
      .eq("id", id);

    if (!error) {
      fetchData();
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa dự án này?")) return;

    const supabase = createClient();

    // Delete related images first
    await supabase.from("project_images").delete().eq("project_id", id);
    // Then delete the project
    await supabase.from("projects").delete().eq("id", id);

    fetchData();
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;
    const supabase = createClient();
    await supabase.from("blogs").delete().eq("id", id);
    fetchData();
  };

  const handleFormClose = () => {
    setShowProjectForm(false);
    setShowBlogForm(false);
    setEditingProject(null);
    setEditingBlog(null);
    fetchData();
  };

  const handleSaveSiteContent = async (section: 'hero' | 'about' | 'contact' | 'gallery' | 'blog') => {
    setSavingContent(true);
    setSaveSuccess('');
    const supabase = createClient();
    let payload: Record<string, unknown> = {};
    if (section === 'hero') payload = heroData;
    if (section === 'about') payload = aboutData;
    if (section === 'contact') payload = contactData;
    if (section === 'gallery') payload = { isVisible: galleryVisible };
    if (section === 'blog') payload = { isVisible: blogVisible };

    const { error } = await supabase
      .from('site_content')
      .upsert({ id: section, data: payload, updated_at: new Date().toISOString() });

    setSavingContent(false);
    if (!error) {
      setSaveSuccess(section);
      setTimeout(() => setSaveSuccess(''), 2000);
    }
  };

  if (showProjectForm || editingProject) {
    return (
      <ProjectForm
        project={editingProject}
        onClose={handleFormClose}
      />
    );
  }

  if (showBlogForm || editingBlog) {
    return (
      <BlogForm
        blog={editingBlog}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Trang Quản Trị</h1>
          <div className="flex items-center gap-2 mt-2 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Dự án ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Bài viết ({blogs.length})
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'homepage'
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Trang chủ
            </button>
          </div>
        </div>
        {activeTab !== 'homepage' && (
        <button
          onClick={() => activeTab === 'projects' ? setShowProjectForm(true) : setShowBlogForm(true)}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'projects' ? "Thêm dự án mới" : "Thêm bài viết mới"}
        </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && activeTab === 'projects' && projects.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg">Chưa có dự án nào</p>
          <p className="text-zinc-600 text-sm mt-1">Nhấn "Thêm dự án mới" để bắt đầu</p>
        </div>
      )}
      {!loading && activeTab === 'blogs' && blogs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg">Chưa có bài viết nào</p>
          <p className="text-zinc-600 text-sm mt-1">Nhấn "Thêm bài viết mới" để bắt đầu</p>
        </div>
      )}

      {/* Project List */}
      {activeTab === 'projects' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group"
          >
            {/* Cover */}
            <div className="aspect-video bg-zinc-800 overflow-hidden relative">
              {project.cover_image ? (
                <img
                  src={project.cover_image}
                  alt={project.title}
                  className={cn(
                    "w-full h-full object-cover transition-all",
                    !project.is_visible && "opacity-25 grayscale"
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-zinc-700" />
                </div>
              )}
              
              {!project.is_visible && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-800">
                    Đang ẩn
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-zinc-200 mb-1">{project.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{project.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleToggleProjectVisibility(project.id, project.is_visible)}
                  className={cn(
                    "p-2 rounded-lg transition-colors border",
                    project.is_visible 
                      ? "text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-100" 
                      : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                  )}
                  title={project.is_visible ? "Ẩn dự án" : "Hiện dự án"}
                >
                  {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingProject(project)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                  <Pencil className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
                <span className="ml-auto text-xs text-zinc-600">
                  {project.images?.length || 0} ảnh
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Blog List */}
      {activeTab === 'blogs' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group"
          >
            {/* Cover */}
            <div className="aspect-video bg-zinc-800 overflow-hidden relative">
              {blog.image_url ? (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-zinc-700" />
                </div>
              )}
              {blog.featured && (
                <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Nổi bật
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-zinc-200 mb-1">{blog.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{blog.excerpt}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {blog.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setEditingBlog(blog)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                  <Pencil className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteBlog(blog.id)}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
                <span className="ml-auto text-xs text-zinc-600">
                  {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Homepage Content Editor */}
      {activeTab === 'homepage' && !loading && (
        <div className="space-y-8 max-w-3xl">
          {/* Hero Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-200">🏠 Hero (Tiêu đề trang chủ)</h3>
              <button
                onClick={() => handleSaveSiteContent('hero')}
                disabled={savingContent}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveSuccess === 'hero' ? '✓ Đã lưu' : 'Lưu'}
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                id="hero-visible"
                checked={heroData.isVisible}
                onChange={(e) => setHeroData({ ...heroData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              <label htmlFor="hero-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
                Hiển thị Section Hero
              </label>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Tiêu đề chính</label>
              <textarea
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phụ đề (dưới nút scroll)</label>
              <input
                type="text"
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* About Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-200">📝 About (Giới thiệu)</h3>
              <button
                onClick={() => handleSaveSiteContent('about')}
                disabled={savingContent}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveSuccess === 'about' ? '✓ Đã lưu' : 'Lưu'}
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                id="about-visible"
                checked={aboutData.isVisible}
                onChange={(e) => setAboutData({ ...aboutData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              <label htmlFor="about-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
                Hiển thị Section About
              </label>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Tiêu đề section</label>
              <input
                type="text"
                value={aboutData.heading}
                onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phụ đề (chức danh)</label>
              <input
                type="text"
                value={aboutData.subheading}
                onChange={(e) => setAboutData({ ...aboutData, subheading: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Các đoạn văn (mỗi đoạn một ô)</label>
              <div className="space-y-3">
                {aboutData.paragraphs.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      value={p}
                      onChange={(e) => {
                        const updated = [...aboutData.paragraphs];
                        updated[idx] = e.target.value;
                        setAboutData({ ...aboutData, paragraphs: updated });
                      }}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
                      rows={3}
                    />
                    {aboutData.paragraphs.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = aboutData.paragraphs.filter((_, i) => i !== idx);
                          setAboutData({ ...aboutData, paragraphs: updated });
                        }}
                        className="text-red-400 hover:text-red-300 px-2"
                        title="Xóa đoạn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setAboutData({ ...aboutData, paragraphs: [...aboutData.paragraphs, ''] })}
                  className="text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 rounded-lg px-4 py-2 w-full transition-colors"
                >
                  + Thêm đoạn văn
                </button>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-200">📞 Contact (Liên hệ)</h3>
              <button
                onClick={() => handleSaveSiteContent('contact')}
                disabled={savingContent}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveSuccess === 'contact' ? '✓ Đã lưu' : 'Lưu'}
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                id="contact-visible"
                checked={contactData.isVisible}
                onChange={(e) => setContactData({ ...contactData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              <label htmlFor="contact-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
                Hiển thị Section Contact
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={contactData.heading}
                  onChange={(e) => setContactData({ ...contactData, heading: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Phụ đề</label>
                <input
                  type="text"
                  value={contactData.subtitle}
                  onChange={(e) => setContactData({ ...contactData, subtitle: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input
                  type="text"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Gallery & Blog Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-200">🖼️ Dự án (Gallery)</h3>
                <button
                  onClick={() => handleSaveSiteContent('gallery')}
                  disabled={savingContent}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveSuccess === 'gallery' ? '✓ Đã lưu' : 'Lưu'}
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <input
                  type="checkbox"
                  id="gallery-visible"
                  checked={galleryVisible}
                  onChange={(e) => setGalleryVisible(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                />
                <label htmlFor="gallery-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
                  Hiển thị Section Dự án
                </label>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-200">📰 Blog</h3>
                <button
                  onClick={() => handleSaveSiteContent('blog')}
                  disabled={savingContent}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveSuccess === 'blog' ? '✓ Đã lưu' : 'Lưu'}
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <input
                  type="checkbox"
                  id="blog-visible"
                  checked={blogVisible}
                  onChange={(e) => setBlogVisible(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                />
                <label htmlFor="blog-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
                  Hiển thị Section Blog
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
