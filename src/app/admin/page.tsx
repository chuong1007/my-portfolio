"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Image as ImageIcon, Save, LayoutDashboard, Eye, EyeOff, FileText, ArrowRight, Palette, BarChart3, Star, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { revalidateCache } from "@/app/actions";
import { getAllProjects } from "@/lib/data";
import type { DbProject, DbProjectImage, DbTag } from "@/lib/types";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { cn, generateSlug } from "@/lib/utils";
import Link from "next/link";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

// Convert mock projects to DbProject format for admin display
function getMockProjectsAsDb(): (DbProject & { images: DbProjectImage[]; isMock?: boolean })[] {
  return getAllProjects().map((p) => ({
    id: p.id,
    title: p.title,
    slug: generateSlug(p.title),
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
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'projects' | 'homepage' | 'analytics' | 'tags'>(
    tabParam === 'homepage' ? 'homepage' : 
    tabParam === 'analytics' ? 'analytics' : 
    tabParam === 'tags' ? 'tags' : 'projects'
  );
  const [tags, setTags] = useState<DbTag[]>([]);
  
  useEffect(() => {
    if (tabParam === 'homepage') setActiveTab('homepage');
    if (tabParam === 'analytics') setActiveTab('analytics');
    if (tabParam === 'tags') setActiveTab('tags');
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

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    
    // Fetch Projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("featured_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (projectsData && projectsData.length > 0) {
      const projectsWithImages = await Promise.all(
        projectsData.map(async (project: DbProject) => {
          const { data: images } = await supabase
            .from("project_images")
            .select("*")
            .eq("project_id", project.id)
            .order("display_order", { ascending: true })
            .limit(500); // Prevent default 30-item limit cutoff
          return { ...project, images: images || [] };
        })
      );
      setProjects(projectsWithImages);

      if (editId) {
        const projectToEdit = projectsWithImages.find((p) => p.id === editId);
        if (projectToEdit) setEditingProject(projectToEdit);
      }
    } else {
      // No Supabase projects yet — show mock projects for editing
      const mockProjects = getMockProjectsAsDb();
      setProjects(mockProjects);

      if (editId) {
        const projectToEdit = mockProjects.find((p) => p.id === editId);
        if (projectToEdit) setEditingProject(projectToEdit);
      }
    }

    // Fetch Site Content
    const { data: siteData } = await supabase.from('site_content').select('*');
    if (siteData) {
      const getRawText = (val: any): string => {
        if (typeof val === 'object' && val !== null) {
          if ('content' in val) {
            if (typeof val.content === 'object' && val.content !== null) {
              return val.content.desktop || val.content.mobile || '';
            }
            return (val.content as string) || '';
          }
        }
        return typeof val === 'string' ? val : '';
      };

      for (const row of siteData) {
        const d = row.data as Record<string, unknown>;
        if (row.id === 'hero') setHeroData({ 
          title: getRawText(d.title), 
          subtitle: getRawText(d.subtitle),
          isVisible: d.isVisible !== false 
        });
        if (row.id === 'about') setAboutData({ 
          heading: getRawText(d.heading), 
          subheading: getRawText(d.subheading), 
          paragraphs: Array.isArray(d.paragraphs) ? d.paragraphs.map(p => getRawText(p)) : [''],
          isVisible: d.isVisible !== false
        });
        if (row.id === 'contact') setContactData({ 
          heading: getRawText(d.heading), 
          subtitle: getRawText(d.subtitle),
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

    // Fetch Tags
    const { data: tagsData } = await supabase
      .from('project_tags')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (tagsData) {
      setTags(tagsData);
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
      await revalidateCache('/');
      fetchData();
    }
  };

  const handleUpdateFeatured = async (id: string, isFeatured: boolean, featuredOrder: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ is_featured: isFeatured, featured_order: featuredOrder })
      .eq("id", id);

    if (!error) {
      await revalidateCache('/');
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

    await revalidateCache('/');
    fetchData();
  };
  const handleAddTag = async (name: string) => {
    if (!name) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('project_tags')
      .insert({ name, display_order: tags.length + 1 });
    
    if (!error) {
      await revalidateCache('/');
      fetchData();
    }
    else alert("Lỗi khi thêm tag: " + error.message);
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Xóa tag này?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('project_tags')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await revalidateCache('/');
      fetchData();
    }
    else alert("Lỗi khi xóa tag: " + error.message);
  };

  const handleUpdateTagOrder = async (id: string, newOrder: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('project_tags')
      .update({ display_order: newOrder })
      .eq('id', id);
    
    if (!error) {
      await revalidateCache('/');
      fetchData();
    }
  };

  const handleUpdateTagName = async (id: string, newName: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('project_tags')
      .update({ name: newName })
      .eq('id', id);
    
    if (!error) {
      await revalidateCache('/');
      fetchData();
    }
  };



  const handleFormClose = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    fetchData();
  };

  const handleSaveSiteContent = async (section: 'hero' | 'about' | 'contact' | 'gallery' | 'blog') => {
    setSavingContent(true);
    setSaveSuccess('');
    try {
      const supabase = createClient();
      
      // Fetch current data to merge
      const { data: currentDbRow } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', section)
        .single();
      
      const currentData = (currentDbRow?.data as Record<string, any>) || {};

      const mergeContent = (oldVal: any, newText: string) => {
        if (typeof oldVal === 'object' && oldVal !== null && 'content' in oldVal) {
          const newContent = typeof oldVal.content === 'object' && oldVal.content !== null
            ? { ...oldVal.content, desktop: newText, mobile: newText, tablet: newText }
            : newText;
          return { ...oldVal, content: newContent };
        }
        return newText;
      };

      let payload: Record<string, unknown> = {};
      
      if (section === 'hero') {
        payload = {
          ...currentData,
          isVisible: heroData.isVisible,
          title: mergeContent(currentData.title, heroData.title),
          subtitle: mergeContent(currentData.subtitle, heroData.subtitle)
        };
      }
      
      if (section === 'about') {
        payload = {
          ...currentData,
          isVisible: aboutData.isVisible,
          heading: mergeContent(currentData.heading, aboutData.heading),
          subheading: mergeContent(currentData.subheading, aboutData.subheading),
          paragraphs: aboutData.paragraphs.map((p, i) => 
            mergeContent(Array.isArray(currentData.paragraphs) ? currentData.paragraphs[i] : null, p)
          )
        };
      }
      
      if (section === 'contact') {
        payload = {
          ...currentData,
          isVisible: contactData.isVisible,
          showFacebook: contactData.showFacebook,
          showZalo: contactData.showZalo,
          heading: mergeContent(currentData.heading, contactData.heading),
          subtitle: mergeContent(currentData.subtitle, contactData.subtitle),
          phone: contactData.phone,
          email: contactData.email
        };
      }
      
      if (section === 'gallery') payload = { ...currentData, isVisible: galleryVisible };
      if (section === 'blog') payload = { ...currentData, isVisible: blogVisible };

      const { error } = await supabase
        .from('site_content')
        .upsert({ id: section, data: payload, updated_at: new Date().toISOString() });

      if (error) throw error;
      await revalidateCache('/');
      setSaveSuccess(section);
      setTimeout(() => setSaveSuccess(''), 2000);
    } catch (err) {
      console.error(`Error saving ${section} content:`, err);
      alert(`Lỗi khi lưu nội dung ${section}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSavingContent(false);
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Trang Quản Trị</h1>
          <div className="flex items-center gap-2 mt-2 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
            <Link
              href="/admin/blogs"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Blog
            </Link>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <Link
              href="/admin/pages"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Trang
            </Link>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
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
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tags'
                  ? 'bg-zinc-800 text-zinc-50 border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Tag className="w-4 h-4" />
              Tags
            </button>
          </div>
        </div>
        {activeTab === 'projects' && (
        <button
          onClick={() => setShowProjectForm(true)}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Thêm dự án mới
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
              <h3 className="text-lg font-bold text-zinc-200 mb-2 leading-relaxed">{project.title}</h3>
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
              <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800 flex-nowrap overflow-x-auto custom-scrollbar-hidden">
                <button
                  onClick={() => handleToggleProjectVisibility(project.id, project.is_visible)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors border shrink-0",
                    project.is_visible 
                      ? "text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-100" 
                      : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                  )}
                  title={project.is_visible ? "Ẩn dự án" : "Hiện dự án"}
                >
                  {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Quick Featured Toggle */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => handleUpdateFeatured(project.id, !project.is_featured, project.featured_order || 0)}
                    className={cn(
                      "p-1.5 transition-colors border shrink-0",
                      project.is_featured 
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10 rounded-l-lg hover:bg-amber-500/20" 
                        : "text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-100 rounded-lg"
                    )}
                    title={project.is_featured ? "Bỏ ghim nổi bật" : "Ghim nổi bật"}
                  >
                    <Star className={cn("w-4 h-4", project.is_featured && "fill-current")} />
                  </button>
                  {project.is_featured && (
                    <input
                      type="number"
                      value={project.featured_order || 0}
                      onChange={async (e) => {
                        const newOrder = parseInt(e.target.value) || 0;
                        const supabase = createClient();
                        await supabase.from("projects").update({ featured_order: newOrder }).eq("id", project.id);
                        fetchData();
                      }}
                      className="w-10 h-[34px] px-1 bg-amber-500/5 border-y border-r border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-r-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-center"
                      min="0"
                      title="Thứ tự ghim"
                    />
                  )}
                </div>
                
                <Link
                  href={`/project/${project.slug || project.id}`}
                  className="flex items-center gap-1 bg-amber-400 text-black px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0"
                >
                  <Palette className="w-3 h-3" />
                  Thiết kế
                </Link>

                <button
                  onClick={() => setEditingProject(project)}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-800 border border-transparent shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400/80 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-400/10 border border-transparent shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Tags Management */}
      {!loading && activeTab === 'tags' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              Quản lý danh mục dự án (Tags)
            </h2>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('tagName') as HTMLInputElement;
                if (!input.value.trim()) return;
                handleAddTag(input.value.trim());
                input.value = '';
              }}
              className="flex gap-2 mb-8"
            >
              <input
                name="tagName"
                type="text"
                placeholder="Tên danh mục mới (vd: Motion Graphics)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm
              </button>
            </form>

            <div className="space-y-3">
              {tags.map((tag) => (
                <div 
                  key={tag.id}
                  className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl group"
                >
                  <div className="flex flex-col items-center gap-1 pr-3 border-r border-zinc-800 min-w-[40px]">
                    <span className="text-[10px] text-zinc-600 font-mono uppercase">Pos</span>
                    <input
                      type="number"
                      value={tag.display_order}
                      onChange={(e) => handleUpdateTagOrder(tag.id, parseInt(e.target.value) || 0)}
                      className="w-10 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-center text-emerald-400 font-bold"
                    />
                  </div>
                  
                  <input
                    type="text"
                    defaultValue={tag.name}
                    onBlur={(e) => e.target.value !== tag.name && handleUpdateTagName(tag.id, e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 font-medium text-zinc-200"
                  />

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Xóa tag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-zinc-500 text-xs mt-6 italic">
              * Thay đổi thứ tự bằng cách điều chỉnh số Pos. Thứ tự xuất hiện trên bộ lọc sẽ tuân theo số này (tăng dần).
            </p>
          </div>
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

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && !loading && (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
