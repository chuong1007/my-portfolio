"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { DbBlog } from "@/lib/types";
import { generateSlug } from "@/lib/utils";
import { RichTextEditor } from "@/components/builder/RichTextEditor";

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
  const [featured, setFeatured] = useState<boolean>(blog?.featured || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

    const supabase = createClient();

    try {
      if (featured) {
        // If this post is featured, un-feature all other posts first
        await supabase.from("blogs").update({ featured: false }).neq("id", blog?.id || "00000000-0000-0000-0000-000000000000"); // A dummy UUID just to ensure it's not null when creating
      }

      const finalSlug = slug || generateSlug(title);

      if (isEditing && blog?.id) {
        // Update existing blog
        await supabase
          .from("blogs")
          .update({
            title,
            slug: finalSlug,
            excerpt,
            content,
            tags,
            image_url: coverImage,
            featured,
          })
          .eq("id", blog.id);
      } else {
        // Insert new blog
        await supabase
          .from("blogs")
          .insert({
            title,
            slug: finalSlug,
            excerpt,
            content,
            tags,
            image_url: coverImage,
            featured,
          });
      }

      onClose();
    } catch (err) {
      console.error("Error saving blog:", err);
    }

    setSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
        </h1>
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
              <span className="text-sm text-zinc-600 shrink-0">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="tu-dong-tao-tu-tieu-de"
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
              />
            </div>
            {slug && (
              <p className="text-xs text-zinc-600 mt-1.5">
                URL: <span className="text-zinc-500 font-mono">/blog/{slug}</span>
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
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-zinc-50 focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="featured-toggle" className="text-zinc-200 cursor-pointer select-none">
              Đặt làm bài viết Nổi bật (Hiển thị đầu trang chủ)
            </label>
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
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !coverImage}
          className="px-8 py-3 bg-zinc-50 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Đăng bài viết"}
        </button>
      </div>
    </div>
  );
}
