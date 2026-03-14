"use client";

import { useState, useEffect } from "react";
import { X, Save, Eye, EyeOff, Upload, Loader2, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { SketchPicker } from "react-color";

type AdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  initialData: any;
  onSave: () => void;
};

export function AdminModal({ isOpen, onClose, sectionId, initialData, onSave }: AdminModalProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    setData({
      ...initialData,
      facebook: initialData?.facebook || '',
      facebookLabel: initialData?.facebookLabel || 'Visit Profile',
      showFacebook: initialData?.showFacebook !== false,
      zalo: initialData?.zalo || '',
      zaloLabel: initialData?.zaloLabel || 'Chat on Zalo',
      showZalo: initialData?.showZalo !== false,
      showPhone: initialData?.showPhone !== false,
      showEmail: initialData?.showEmail !== false,
      isVisible: initialData?.isVisible !== false,
      // For UX Builder Blocks
      type: initialData?.type || 'text',
      span: initialData?.span || 12,
      data: initialData?.data || { title: '', content: '' }
    });
  }, [initialData, isOpen]);

  const handleBlockDataChange = (newData: any) => {
    setData({ ...data, data: { ...data.data, ...newData } });
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      setData({ ...data, logoImageUrl: publicUrl });
    } catch (err: any) {
      setError(`Lỗi tải ảnh: ${err.message}`);
    } finally {
      setLogoUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    // Normalize Facebook link
    let finalData = { ...data };
    if (finalData.facebook && !finalData.facebook.startsWith('http')) {
      finalData.facebook = `https://${finalData.facebook}`;
    }

    const supabase = createClient();
    const { error: saveError } = await supabase
      .from('site_content')
      .upsert({ id: sectionId, data: finalData, updated_at: new Date().toISOString() });

    if (!saveError) {
      window.dispatchEvent(new Event('contentUpdated'));
      onSave();
      onClose();
    } else {
      const msg = saveError.message;
      if (msg.includes("site_content") || msg.includes("cache")) {
        setError("Lỗi: Bảng 'site_content' chưa tồn tại. Vui lòng chạy mã trong file 'supabase_setup.sql' tại Supabase SQL Editor.");
      } else {
        setError(`Lỗi: ${msg}`);
      }
      console.error("Save Error:", saveError);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white capitalize">Edit {sectionId} Section</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {sectionId === 'hero' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl space-y-4">
                <label className="block text-sm font-bold text-zinc-300">Cấu hình Logo Header</label>
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setData({ ...data, logoType: 'text' })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      (data.logoType || 'text') === 'text' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Text Logo
                  </button>
                  <button
                    onClick={() => setData({ ...data, logoType: 'image' })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      data.logoType === 'image' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Image Logo
                  </button>
                </div>

                {(data.logoType || 'text') === 'text' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Logo Text</label>
                      <input
                        type="text"
                        value={data.logoText || ''}
                        placeholder="VD: CHUONG.GRAPHIC"
                        onChange={(e) => setData({ ...data, logoText: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Màu Logo</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="w-full flex items-center justify-between bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 hover:border-zinc-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md shadow-sm border border-zinc-700" style={{ backgroundColor: data.logoColor || '#FFFFFF' }} />
                            <span className="text-sm font-mono text-zinc-300">{data.logoColor || '#FFFFFF'}</span>
                          </div>
                          <Palette className="w-4 h-4 text-zinc-500" />
                        </button>
                        
                        {showColorPicker && (
                          <div className="absolute top-14 left-0 z-50">
                            <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                            <div className="relative z-10 p-2 bg-[#1a1a1a] border border-[#222] rounded-xl shadow-2xl">
                              <SketchPicker
                                color={data.logoColor || '#FFFFFF'}
                                onChange={(color) => setData({ ...data, logoColor: color.hex })}
                                className="!bg-[#222] !shadow-none !border-none"
                                styles={{
                                  default: {
                                    picker: { background: '#222', borderRadius: '8px', border: '1px solid #333' }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Logo Image (Ảnh/SVG)</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={data.logoImageUrl || ''}
                            placeholder="https://path-to-your-logo.png"
                            onChange={(e) => setData({ ...data, logoImageUrl: e.target.value })}
                            className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                          />
                          <label className="cursor-pointer bg-white text-black px-4 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-all shrink-0">
                            {logoUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            <input
                              type="file"
                              accept="image/*,.svg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                              }}
                            />
                          </label>
                        </div>
                        
                        {data.logoImageUrl && (
                          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center">
                            <img 
                              src={data.logoImageUrl} 
                              alt="Logo Preview" 
                              className="h-12 w-auto object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Main Title</label>
                <textarea
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500 resize-none text-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Subtitle</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          )}

          {sectionId === 'about' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Heading</label>
                <input
                  type="text"
                  value={data.heading}
                  onChange={(e) => setData({ ...data, heading: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Subheading</label>
                <input
                  type="text"
                  value={data.subheading}
                  onChange={(e) => setData({ ...data, subheading: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Paragraphs</label>
                <div className="space-y-3">
                  {data.paragraphs?.map((p: string, i: number) => (
                    <textarea
                      key={i}
                      value={p}
                      onChange={(e) => {
                        const updated = [...data.paragraphs];
                        updated[i] = e.target.value;
                        setData({ ...data, paragraphs: updated });
                      }}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500 resize-none"
                      rows={3}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {sectionId === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Heading</label>
                <input
                  type="text"
                  value={data.heading}
                  onChange={(e) => setData({ ...data, heading: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-zinc-500 mb-2 font-medium">Subtitle</label>
                <textarea
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500 resize-none"
                  rows={2}
                />
              </div>

              {/* Font Settings for Contact Heading */}
              <div className="col-span-1 md:col-span-2 p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl space-y-4">
                <label className="block text-sm font-bold text-zinc-300">Cấu hình Font chữ Tiêu đề</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Cỡ chữ (VD: 5rem, 64px...)</label>
                    <input
                      type="text"
                      value={data.headingFontSize || ''}
                      placeholder="Mặc định: 6xl - 8xl"
                      onChange={(e) => setData({ ...data, headingFontSize: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Font chữ (CSS Family)</label>
                    <input
                      type="text"
                      value={data.headingFontFamily || ''}
                      placeholder="VD: 'Inter', sans-serif"
                      onChange={(e) => setData({ ...data, headingFontFamily: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic">* Để trống để sử dụng cỡ chữ mặc định của giao diện.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Số điện thoại</label>
                  <button
                    onClick={() => setData({ ...data, showPhone: !data.showPhone })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      data.showPhone !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showPhone !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {data.showPhone !== false ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Email</label>
                  <button
                    onClick={() => setData({ ...data, showEmail: !data.showEmail })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      data.showEmail !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showEmail !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {data.showEmail !== false ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <input
                  type="text"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Kết nối Facebook</label>
                  <button
                    onClick={() => setData({ ...data, showFacebook: !data.showFacebook })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      data.showFacebook ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showFacebook ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {data.showFacebook ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={data.facebook || ''}
                      onChange={(e) => setData({ ...data, facebook: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Link Facebook (https://...)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={data.facebookLabel || ''}
                      onChange={(e) => setData({ ...data, facebookLabel: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Nhãn (VD: Ghé thăm)"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Kết nối Zalo</label>
                  <button
                    onClick={() => setData({ ...data, showZalo: !data.showZalo })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      data.showZalo ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showZalo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {data.showZalo ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={data.zalo || ''}
                      onChange={(e) => setData({ ...data, zalo: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Zalo (Số điện thoại hoặc Link)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={data.zaloLabel || ''}
                      onChange={(e) => setData({ ...data, zaloLabel: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Nhãn (VD: Nhắn Zalo)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(sectionId === 'gallery' || sectionId === 'blog') && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm italic py-4">
                Cấu hình hiển thị cho section {sectionId === 'gallery' ? 'Dự án' : 'Blog'}.
              </p>
            </div>
          )}

          {/* UX Builder Block Editor */}
          {sectionId.includes('col-') && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl space-y-4">
                <label className="block text-sm font-bold text-zinc-300">Loại nội dung cột</label>
                <div className="grid grid-cols-2 gap-2">
                  {['text', 'image', 'projects', 'blogs'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setData({ ...data, type: t, data: t === 'text' ? { title: '', content: '' } : t === 'image' ? { url: '', alt: '' } : {} })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                        data.type === t 
                          ? "bg-white text-black border-white" 
                          : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {data.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Tiêu đề</label>
                    <input
                      type="text"
                      value={data.data?.title || ''}
                      onChange={(e) => handleBlockDataChange({ title: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Nội dung</label>
                    <textarea
                      value={data.data?.content || ''}
                      onChange={(e) => handleBlockDataChange({ content: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500 resize-none"
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {data.type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Link ảnh</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={data.data?.url || ''}
                        onChange={(e) => handleBlockDataChange({ url: e.target.value })}
                        className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-white text-black px-5 py-4 rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all shrink-0">
                        {logoUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setLogoUploading(true);
                            try {
                              const supabase = createClient();
                              const fileName = `builder-${Date.now()}-${file.name}`;
                              const { error: upError } = await supabase.storage.from("project-images").upload(`site/${fileName}`, file);
                              if (upError) throw upError;
                              const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(`site/${fileName}`);
                              handleBlockDataChange({ url: publicUrl });
                            } catch (err: any) {
                              setError(err.message);
                            } finally {
                              setLogoUploading(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={data.data?.alt || ''}
                    onChange={(e) => handleBlockDataChange({ alt: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                    placeholder="Mô tả ảnh (Alt text)"
                  />
                </div>
              )}

              {(data.type === 'projects' || data.type === 'blogs') && (
                <div className="space-y-4">
                   <p className="text-zinc-500 text-sm italic">Khối này sẽ tự động lấy danh sách {data.type === 'projects' ? 'Dự án' : 'Bài viết'} mới nhất.</p>
                   <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Tiêu đề nhóm (Không bắt buộc)</label>
                    <input
                      type="text"
                      value={data.data?.title || ''}
                      onChange={(e) => handleBlockDataChange({ title: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visibility Toggle for all sections */}
          <button
            onClick={() => setData({ ...data, isVisible: !data.isVisible })}
            className={cn(
              "flex items-center gap-3 w-full p-4 rounded-2xl border transition-all duration-300",
              data.isVisible !== false 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                : "bg-zinc-800/30 border-zinc-800 text-zinc-500"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              data.isVisible !== false ? "bg-emerald-500/10" : "bg-zinc-800"
            )}>
              {data.isVisible !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-bold">
                {data.isVisible !== false ? "Section đang hiện" : "Section đang ẩn"}
              </span>
              <span className="text-xs opacity-60">
                {data.isVisible !== false ? "Click để ẩn khỏi trang chủ" : "Click để hiện lại trên trang chủ"}
              </span>
            </div>
          </button>
        </div>

        {error && (
          <div className="px-8 py-3 bg-red-500/10 border-y border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
