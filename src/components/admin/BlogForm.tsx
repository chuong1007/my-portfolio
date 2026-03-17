"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X, Link2, Code2, Palette, Eye, EyeOff, ExternalLink, Save as SaveIcon, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { generateSlug } from "@/lib/utils";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/builder/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });

const AVAILABLE_TAGS = [
  "Branding",
  "UI/UX Design",
  "Graphic Design",
  "AI Tools",
  "Digital Marketing",
  "Content Strategy",
  "Storytelling",
  "Minimalism",
  "Typography",
  "Career Tips",
  "AI Innovation"
];

type BlogFormProps = {
  blog?: DbBlog | null;
  onClose: () => void;
};

export function BlogForm({ blog, onClose }: BlogFormProps) {
  const isEditing = !!blog;

  const [title, setTitle] = useState(blog?.title || "");
  const [slug, setSlug] = useState(blog?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!blog?.slug);
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "");
  const [content, setContent] = useState(blog?.content || "");
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [coverImage, setCoverImage] = useState<string>(blog?.image_url || "");
  const [isFeatured, setIsFeatured] = useState<boolean>(blog?.is_featured || false);
  const [isPublished, setIsPublished] = useState<boolean>(blog?.is_published ?? true);
  const [customCss, setCustomCss] = useState(blog?.custom_css || "");
  const [customHtml, setCustomHtml] = useState(blog?.custom_html || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (!slug) return;
    const fullUrl = `https://chuong-graphic.vercel.app/blog/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-generate slug from title when not manually edited
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    // Only allow URL-safe characters
    const sanitized = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(sanitized);
    setSlugManuallyEdited(true);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const fileName = `blogs/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("project-images") // Reusing the same bucket for simplicity
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      setCoverImage(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !coverImage) return;
    setSaving(true);
    try {
      const supabase = createClient();
      
      const finalSlug = slug || generateSlug(title);
      const blogData = {
        title,
        slug: finalSlug,
        excerpt,
        content,
        tags,
        image_url: coverImage,
        is_featured: isFeatured,
        is_published: isPublished,
        custom_css: customCss,
        custom_html: customHtml,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && blog?.id) {
        const { error } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", blog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blogs")
          .insert({ ...blogData, created_at: new Date().toISOString() });
        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (!isEditing) {
        onClose();
      }
    } catch (err) {
      console.error("Critical error saving blog:", err);
      alert(`Lỗi khi lưu blog: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Sticky Quick Actions Bar */}
      <div className="sticky top-0 z-[60] -mx-4 px-4 py-4 mb-8 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between gap-4 rounded-b-2xl shadow-xl shadow-black/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors p-2 hover:bg-zinc-900 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">
              {isEditing ? `Sửa: ${title}` : "Thêm bài viết mới"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Visibility Toggle */}
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
              isPublished 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
            }`}
          >
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden xs:inline">{isPublished ? "Công khai" : "Đang ẩn"}</span>
          </button>

          {/* Preview Button */}
          {isEditing && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden xs:inline">Xem trước</span>
            </a>
          )}

          {/* Quick Save */}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !coverImage}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
            <span>{saving ? "Đang lưu..." : saveSuccess ? "Đã lưu" : isEditing ? "Cập nhật" : "Đăng bài"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <Link2 className="w-4 h-4 inline mr-1.5" />
              Đường dẫn (Slug)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-600 transition-all overflow-hidden line-clamp-1">
                <span className="text-sm text-zinc-500 shrink-0 whitespace-nowrap hidden sm:inline-block">https://chuong-graphic.vercel.app/blog/</span>
                <span className="text-sm text-zinc-500 shrink-0 whitespace-nowrap sm:hidden">.../blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  className="flex-1 bg-transparent text-zinc-50 font-mono text-sm placeholder:text-zinc-600 focus:outline-none min-w-0 ml-1"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                disabled={!slug}
                className="shrink-0 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {slug && (
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                URL: <a href={`https://chuong-graphic.vercel.app/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 font-mono hover:text-white transition-colors break-all">https://chuong-graphic.vercel.app/blog/{slug}</a>
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Mô tả tóm tắt (Excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Viết tóm tắt hiển thị ở thẻ bài viết..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Nội dung bài viết
            </label>
            <RichTextEditor 
              content={content}
              onChange={setContent}
              placeholder="Viết nội dung bài viết tuyệt vời của bạn ở đây..."
              className="bg-zinc-900 border-zinc-800"
              editable={true}
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <input
              type="checkbox"
              id="featured-toggle"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-zinc-50 focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="featured-toggle" className="text-zinc-200 cursor-pointer select-none">
              Đánh dấu bài viết Nổi bật
            </label>
          </div>

          {/* Custom CSS & HTML */}
          <div className="mt-8 pt-8 border-t border-zinc-800 space-y-6">
            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              Tùy biến Giao diện (Nâng cao)
            </h3>

            {/* Custom CSS */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                <Palette className="w-4 h-4" />
                Custom CSS
              </label>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder={`.blog-title { color: #ff6b6b; }\n.custom-section { background: linear-gradient(...); }`}
                rows={6}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-mono text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-y custom-scrollbar"
                spellCheck={false}
              />
            </div>

            {/* Custom HTML */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                <Code2 className="w-4 h-4" />
                Custom HTML Layout
              </label>
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                placeholder={`<div class="custom-widget">\n  <!-- Widget hoặc bố cục đặc biệt -->\n</div>`}
                rows={6}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sky-400 font-mono text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-y custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Side Config */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Ảnh bìa *
            </label>
            {coverImage ? (
              <div className="relative w-full aspect-video">
                <img
                  src={coverImage}
                  alt="Cover"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl border border-zinc-800 bg-zinc-900"
                />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full aspect-video border-2 border-dashed border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-600 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">
                    {uploading ? "Đang tải lên..." : "Click để upload ảnh bìa"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isActive = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                        : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-end gap-4">
        <button
          onClick={onClose}
          className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
        >
          {isEditing ? "Đóng" : "Hủy bỏ"}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !coverImage}
          className="px-8 py-3 bg-zinc-50 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <SaveIcon className="w-4 h-4" />
          )}
          <span>{saving ? "Đang lưu..." : saveSuccess ? "Đã lưu" : isEditing ? "Cập nhật" : "Đăng bài viết"}</span>
        </button>
      </div>
    </div>
  );
}
