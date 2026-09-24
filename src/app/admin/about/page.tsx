"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, ArrowLeft, Plus, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { revalidateCache } from "@/app/actions";
import { AvatarSelector } from "@/components/admin/AvatarSelector";
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
  type ExpandedBlock = { id: string; type: 'full' | 'half'; title?: string; content: string; };
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
        const parsedBlocks = d.expandedBlocks.map((b: any) => {
          if (b.title !== undefined) return b; 
          const match = b.content.match(/<p><strong>(.*?)<\/strong><\/p>(.*)/s);
          if (match) {
            return { ...b, title: match[1].replace(/^\d+\.\s*/, ''), content: match[2] };
          }
          return { ...b, title: "Untitled", content: b.content };
        });
        setExpandedBlocks(parsedBlocks);
      } else {
        setAvatarUrl('/avatar-emoji.svg');
        const blocks: ExpandedBlock[] = [
          {
            id: crypto.randomUUID(),
            type: "full",
            title: "Giới thiệu bản thân",
            content: "<p>Graphic Designer với hơn 7 năm kinh nghiệm...</p>"
          }
        ];
        setExpandedBlocks(blocks);
      }
      setIsVisible(d.isVisible !== false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addBlock = () => {
    setExpandedBlocks([...expandedBlocks, { id: crypto.randomUUID(), type: 'full', title: "", content: "" }]);
  };

  const removeBlock = (id: string) => {
    setExpandedBlocks(expandedBlocks.filter(b => b.id !== id));
  };

  const updateBlockTitle = (id: string, title: string) => {
    setExpandedBlocks(expandedBlocks.map(b => b.id === id ? { ...b, title } : b));
  };

  const updateBlockContent = (id: string, content: string) => {
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              About Editor (Giao diện 2 cột)
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
              Chỉnh sửa nội dung trực quan giống layout trang chủ
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

      <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 max-w-4xl">
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

      {/* --- MÔ PHỎNG LAYOUT TRANG CHỦ --- */}

      {/* INTRO SECTION: 2 CỘT */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
          Phần mở đầu (Intro)
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* CỘT TRÁI (5/12) */}
          <div className="w-full md:w-5/12 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Avatar</label>
              <AvatarSelector value={avatarUrl} onChange={(url) => setAvatarUrl(url)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tiêu đề chính</label>
              <RichTextEditor
                content={heading}
                onChange={(html: string) => setHeading(html)}
                editable={true}
                placeholder="Ví dụ: About me"
                minHeight="50px"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Phụ đề</label>
              <RichTextEditor
                content={subheading}
                onChange={(html: string) => setSubheading(html)}
                editable={true}
                placeholder="Chức danh / Số năm kinh nghiệm"
                minHeight="50px"
              />
            </div>
          </div>

          {/* CỘT PHẢI (7/12) */}
          <div className="w-full md:w-7/12 space-y-6 md:pt-[72px]">
             <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Đoạn văn giới thiệu</label>
              <button
                onClick={() => setParagraphs([...paragraphs, ""])}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-emerald-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm đoạn
              </button>
            </div>
            
            <div className="space-y-4">
              {paragraphs.map((p, idx) => (
                <div key={idx} className="relative group">
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
                  {paragraphs.length > 1 && (
                    <button
                      onClick={() => setParagraphs(paragraphs.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDED BLOCKS SECTION: 2 CỘT */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Phần chi tiết (Xem thêm)
          </h2>
          <button 
            onClick={addBlock}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold transition-colors border border-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Thêm dòng nội dung
          </button>
        </div>

        <div className="space-y-12">
          {expandedBlocks.map((block, index) => (
            <div key={block.id} className="relative group border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700 transition-colors bg-zinc-950/50">
               <button 
                  onClick={() => removeBlock(block.id)}
                  className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                  title="Xóa dòng này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
              <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                {/* CỘT TRÁI (5/12) */}
                <div className="w-full md:w-5/12 space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                      {index + 1}
                    </span>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tiêu đề (Sticky)</label>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <RichTextEditor
                      content={block.title || ""}
                      onChange={(html: string) => updateBlockTitle(block.id, html)}
                      editable={true}
                      placeholder={`Ví dụ: Kinh nghiệm làm việc...`}
                      minHeight="50px"
                    />
                  </div>
                </div>

                {/* CỘT PHẢI (7/12) */}
                <div className="w-full md:w-7/12 space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Nội dung chi tiết</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <RichTextEditor
                      content={block.content}
                      onChange={(html: string) => updateBlockContent(block.id, html)}
                      editable={true}
                      placeholder={`Nội dung...`}
                      minHeight="200px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {expandedBlocks.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
              <p className="text-zinc-500">Chưa có nội dung chi tiết. Bấm "Thêm dòng nội dung" để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Save Button */}
      <div className="sticky bottom-0 z-50 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-6 pb-6 -mx-4 px-4">
        <div className="flex justify-end max-w-7xl mx-auto">
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
