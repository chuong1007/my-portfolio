"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, ArrowLeft, Plus, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { revalidateCache } from "@/app/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/builder/RichTextEditor").then((m: { RichTextEditor: React.ComponentType<any> }) => m.RichTextEditor),
  { ssr: false }
);

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // About data
  const [avatarUrl, setAvatarUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([""]);
  type ExpandedBlock = { id: string; type: 'full' | 'half'; content: string; };
  const [expandedBlocks, setExpandedBlocks] = useState<ExpandedBlock[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Raw DB data for merging
  const [rawDbData, setRawDbData] = useState<Record<string, any>>({});

  const getRawText = (val: any): string => {
    if (typeof val === "object" && val !== null) {
      if ("content" in val) {
        if (typeof val.content === "object" && val.content !== null) {
          return val.content.desktop || val.content.mobile || "";
        }
        return (val.content as string) || "";
      }
    }
    return typeof val === "string" ? val : "";
  };

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "about")
      .single();

    if (data?.data) {
      const d = data.data as Record<string, any>;
      setRawDbData(d);
      setHeading(getRawText(d.heading));
      setSubheading(getRawText(d.subheading));
      if (Array.isArray(d.paragraphs) && d.paragraphs.length > 0) {
        setParagraphs(d.paragraphs.map((p: any) => getRawText(p)));
      }
      setAvatarUrl(d.avatarUrl || "");
      if (d.expandedBlocks && d.expandedBlocks.length > 0) {
        setExpandedBlocks(d.expandedBlocks);
      } else {
        // Migration from old format & khôi phục lại dữ liệu người dùng đã gõ bị mất do reload
        const blocks: ExpandedBlock[] = [];
        blocks.push({ id: crypto.randomUUID(), type: 'half', content: '<p><strong>1. Giới thiệu bản thân</strong></p><p>Là một người ham học hỏi, thích ứng nhanh với môi trường làm việc, không ngại khó khăn và chịu được áp lực cao. Tôi có khả năng giải quyết tốt các rào cản trong công việc; đôi khi hơi kỹ tính khi tập trung cao độ để đạt được kết quả hoàn hảo nhất.</p><p>Với nền tảng kinh nghiệm đa dạng, tôi mong muốn áp dụng kiến thức chuyên môn của mình để đóng góp vào sự phát triển...</p>' });
        blocks.push({ id: crypto.randomUUID(), type: 'half', content: '<p><strong>2. Kỹ năng và Học vấn</strong></p><p><strong>Kỹ năng chuyên môn</strong></p><ul><li><strong>Thiết kế:</strong> Photoshop, Adobe Illustrator (Sử dụng thành thạo).</li><li><strong>Dựng phim:</strong> Adobe Premiere (Cơ bản).</li><li><strong>Kỹ năng mềm:</strong> Teamwork, Giao tiếp, Tiếng Anh giao tiếp tốt.</li></ul><p><strong>Học vấn</strong></p><ul><li><strong>Đại học Công nghiệp TP.HCM (2013 - 2017):</strong> Tốt nghiệp chuyên ngành Quản trị kinh doanh.</li><li><strong>2017 - Nay:</strong> Tự học chuyên sâu về tư duy thiết kế và các phần mềm đồ họa chuyên nghiệp.</li></ul>' });
        blocks.push({ id: crypto.randomUUID(), type: 'half', content: '<p><strong>3. Vị trí cột 3</strong></p><p>Điền nội dung cột 3 tại đây...</p>' });
        blocks.push({ id: crypto.randomUUID(), type: 'half', content: '<p><strong>4. Vị trí cột 4</strong></p><p>Điền nội dung cột 4 tại đây...</p>' });
        setExpandedBlocks(blocks);
      }
      setIsVisible(d.isVisible !== false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addBlock = (type: 'full' | 'half') => {
    setExpandedBlocks([...expandedBlocks, { id: crypto.randomUUID(), type, content: "" }]);
  };

  const removeBlock = (id: string) => {
    setExpandedBlocks(expandedBlocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, content: string) => {
    setExpandedBlocks(expandedBlocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const supabase = createClient();

      const mergeContent = (oldVal: any, newText: string) => {
        if (typeof oldVal === "object" && oldVal !== null && "content" in oldVal) {
          const newContent =
            typeof oldVal.content === "object" && oldVal.content !== null
              ? { ...oldVal.content, desktop: newText, mobile: newText, tablet: newText }
              : newText;
          return { ...oldVal, content: newContent };
        }
        return newText;
      };

      const payload = {
        ...rawDbData,
        isVisible,
        avatarUrl,
        expandedBlocks,
        heading: mergeContent(rawDbData.heading, heading),
        subheading: mergeContent(rawDbData.subheading, subheading),
        paragraphs: paragraphs.map((p, i) =>
          mergeContent(
            Array.isArray(rawDbData.paragraphs) ? rawDbData.paragraphs[i] : null,
            p
          )
        ),
      };

      const { error } = await supabase
        .from("site_content")
        .upsert({ id: "about", data: payload, updated_at: new Date().toISOString() });

      if (error) throw error;
      await revalidateCache("/");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Save error:", err);
      alert(`Lỗi khi lưu: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <User className="w-6 h-6 text-blue-500" />
              About Block Editor
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
              Chỉnh sửa nội dung giới thiệu trên trang chủ
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            saveSuccess
              ? "bg-emerald-500 text-white"
              : "bg-white text-black hover:bg-zinc-200"
          } disabled:opacity-50`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveSuccess ? "✓ Đã lưu" : saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <input
          type="checkbox"
          id="about-visible"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500"
        />
        <label htmlFor="about-visible" className="text-sm font-medium text-zinc-300 cursor-pointer">
          Hiển thị Section About trên trang chủ
        </label>
      </div>

      {/* Avatar Upload */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Ảnh đại diện (Avatar)
        </h3>
        <div className="flex items-start gap-6">
          {/* Avatar Preview */}
          <div className="shrink-0">
            {avatarUrl ? (
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border-2 border-zinc-700 shadow-2xl"
                />
                <button
                  onClick={() => setAvatarUrl("")}
                  className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/50">
                <User className="w-10 h-10 text-zinc-600" />
              </div>
            )}
          </div>
          
          {/* Upload Area */}
          <div className="flex-1">
            <ImageUpload
              value=""
              onChange={(url) => setAvatarUrl(url)}
              bucket="project-images"
              path="avatars"
              label=""
              aspectRatio="square"
              className="max-w-[180px] [&_label]:min-h-[120px]"
            />
            <p className="text-xs text-zinc-600 mt-2">
              Kích thước đề xuất: 200×200px trở lên. Ảnh sẽ hiển thị dạng tròn.
            </p>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Tiêu đề Section
        </h3>
        <RichTextEditor
          content={heading}
          onChange={(html: string) => setHeading(html)}
          editable={true}
          placeholder="Ví dụ: About"
          minHeight="60px"
        />
      </div>

      {/* Subheading */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Phụ đề / Chức danh
        </h3>
        <RichTextEditor
          content={subheading}
          onChange={(html: string) => setSubheading(html)}
          editable={true}
          placeholder="Ví dụ: Senior Graphic Designer | 7 Years of Experience"
          minHeight="60px"
        />
      </div>

      {/* Paragraphs */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Nội dung giới thiệu mở đầu
          </h3>
          <button
            onClick={() => setParagraphs([...paragraphs, ""])}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-emerald-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm đoạn
          </button>
        </div>
        <div className="space-y-4">
          {paragraphs.map((p, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-medium">Đoạn {idx + 1}</span>
                {paragraphs.length > 1 && (
                  <button
                    onClick={() => setParagraphs(paragraphs.filter((_, i) => i !== idx))}
                    className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa
                  </button>
                )}
              </div>
              <RichTextEditor
                content={p}
                onChange={(html: string) => {
                  const newParagraphs = [...paragraphs];
                  newParagraphs[idx] = html;
                  setParagraphs(newParagraphs);
                }}
                editable={true}
                placeholder={`Nội dung đoạn ${idx + 1}...`}
                minHeight="100px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Content Blocks */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Nội dung chi tiết (Nhiều cột)
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => addBlock('full')}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors border border-zinc-700"
              title="Thêm cột chiếm toàn bộ chiều ngang"
            >
              <Plus className="w-3.5 h-3.5" /> Fullwidth
            </button>
            <button 
              onClick={() => addBlock('half')}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors border border-zinc-700"
              title="Thêm cột chiếm 1/2 chiều ngang"
            >
              <Plus className="w-3.5 h-3.5" /> Cột 1/2
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-6">
          Nội dung này sẽ hiển thị khi người dùng bấm nút &quot;Xem chi tiết&quot; trên trang chủ. Bạn có thể thêm cột Fullwidth (100% ngang) hoặc cột 1/2 (50% ngang, sẽ xếp cột cạnh nhau trên Desktop).
        </p>

        <div className="flex flex-col gap-8">
          {expandedBlocks.map((block, index) => (
            <div key={block.id} className="space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Cột {index + 1} ({block.type === 'full' ? 'Fullwidth' : 'Cột 1/2'})
                </span>
                <button 
                  onClick={() => removeBlock(block.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="Xóa cột này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-[250px] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-700 transition-colors">
                <RichTextEditor
                  content={block.content}
                  onChange={(html: string) => updateBlock(block.id, html)}
                  editable={true}
                  placeholder={`Nội dung cột ${index + 1}...`}
                  minHeight="250px"
                />
              </div>
            </div>
          ))}
          {expandedBlocks.length === 0 && (
            <div className="text-center py-10 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700">
              <p className="text-zinc-500 text-sm">Chưa có cột nội dung nào. Bấm nút Thêm ở trên để tạo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Save Button */}
      <div className="sticky bottom-0 z-50 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-6 pb-6 -mx-4 px-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl ${
              saveSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-white text-black hover:bg-zinc-200 shadow-white/5"
            } disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? "✓ Đã lưu thành công" : saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
