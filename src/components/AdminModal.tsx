"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Save,
  Plus, 
  Minus, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Loader2, 
  Upload,
  Palette,
  Trash2,
  Eye,
  EyeOff,
  Image as LucideImage
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { RichTextEditor, type RichTextData } from "./RichTextEditor";
import { cn } from "@/lib/utils";
import { SketchPicker } from "react-color";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, setResponsiveValue, type DeviceMode } from "@/lib/responsive-helpers";

type AdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  initialData: Record<string, unknown>;
  onSave: () => void;
};

const DEVICE_ICONS: Record<DeviceMode, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};
const DEVICE_LABELS: Record<DeviceMode, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

export function AdminModal({ isOpen, onClose, sectionId, initialData, onSave }: AdminModalProps) {
  const { globalPreviewMode } = useAdmin();
  const [data, setData] = useState<Record<string, any>>(initialData);
  const DeviceIcon = DEVICE_ICONS[globalPreviewMode];
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    // Helper to normalize content to RichTextData object
    const normalize = (val: any): RichTextData => {
      if (typeof val === 'object' && val !== null && 'content' in val) return val;
      return { 
        content: val || '', 
        fontSize: { mobile: 16, tablet: 18, desktop: 20 } 
      };
    };

    setData({
      ...initialData,
      title: normalize(initialData?.title),
      subtitle: normalize(initialData?.subtitle),
      heading: normalize(initialData?.heading),
      subheading: normalize(initialData?.subheading),
      paragraphs: Array.isArray(initialData?.paragraphs) ? initialData.paragraphs.map((p: any) => normalize(p)) : [],
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
      data: initialData?.data || { title: normalize(''), content: normalize('') }
    });
  }, [initialData, isOpen]);

  const handleBlockDataChange = (newData: Record<string, any>) => {
    setData({ ...data, data: { ...data.data, ...newData } });
  };

  // Real-time Preview Synchronization
  useEffect(() => {
    if (isOpen) {
      // Local sync (for non-iframe mode)
      window.dispatchEvent(new CustomEvent('previewUpdate', { detail: { sectionId, data } }));
      
      // Cross-window sync (for parent to iframe preview)
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'PREVIEW_UPDATE', 
          sectionId, 
          data 
        }, '*');
      }
    }
  }, [data, sectionId, isOpen]);

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
    } catch (err) {
      setError(`Lỗi tải ảnh: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLogoUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    // Normalize Facebook link
    const finalData = { ...data };
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
    <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-none">
      {/* Backdrop mờ để user vẫn thấy nội dung website phía sau mà không bị che khuất */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />
      
      {/* Sidebar Panel - Pinned to the right */}
      <div className="relative bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 w-full md:max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white capitalize">Edit {sectionId} Section</h2>
            {/* Device Indicator */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
              globalPreviewMode === 'desktop' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              globalPreviewMode === 'tablet' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
              "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}>
              <DeviceIcon className="w-3.5 h-3.5" />
              {DEVICE_LABELS[globalPreviewMode]}
            </div>
          </div>
          <button onClick={() => {
            window.dispatchEvent(new CustomEvent('previewUpdate', { detail: { sectionId, data: initialData } }));
            onClose();
          }} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
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
                        value={getResponsiveValue(data.logoText, globalPreviewMode) || ''}
                        placeholder="VD: CHUONG.GRAPHIC"
                        onChange={(e) => setData({ ...data, logoText: setResponsiveValue(data.logoText, globalPreviewMode, e.target.value) })}
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

              <div className="space-y-4">
                <RichTextEditor
                  label="Title"
                  value={data.title}
                  onChange={(val) => setData({ ...data, title: val })}
                />
              </div>

              {/* Font sizes are now controlled inside RichTextEditor */}

              {/* Sliders for Max Width & Padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Title Max Width (%)</label>
                    <span className="text-xs font-mono text-zinc-500">{getResponsiveValue(data.titleMaxWidth, globalPreviewMode) || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={getResponsiveValue(data.titleMaxWidth, globalPreviewMode) || "100"}
                    onChange={(e) => setData({ ...data, titleMaxWidth: setResponsiveValue(data.titleMaxWidth, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Dùng để ép văn bản tự rớt dòng (text-balance) đẹp hơn.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Top (px)</label>
                    <span className="text-xs font-mono text-zinc-500">{getResponsiveValue(data.paddingTop, globalPreviewMode) || 80}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingTop: setResponsiveValue(data.paddingTop, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Chỉnh khoảng cách phía trên Section.</p>
                </div>
              </div>

              <div className="space-y-4">
                <RichTextEditor
                  label="Subtitle"
                  value={data.subtitle}
                  onChange={(val) => setData({ ...data, subtitle: val })}
                />
              </div>
            </div>
          )}

          {sectionId === 'about' && (
            <div className="space-y-4">
              <div className="space-y-6">
                <RichTextEditor
                  label="Heading"
                  value={data.heading}
                  onChange={(val) => setData({ ...data, heading: val })}
                />
                
                <RichTextEditor
                  label="Subheading"
                  value={data.subheading}
                  onChange={(val) => setData({ ...data, subheading: val })}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Paragraphs</label>
                    <button 
                      onClick={() => setData({ ...data, paragraphs: [...data.paragraphs, { content: '', fontSize: { mobile: 16, tablet: 18, desktop: 20 } }] })}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-emerald-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.paragraphs?.map((p: any, i: number) => (
                      <div key={i} className="relative group">
                         <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                const updated = [...data.paragraphs];
                                updated.splice(i, 1);
                                setData({ ...data, paragraphs: updated });
                              }}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         <RichTextEditor
                            label={`Paragraph ${i + 1}`}
                            value={p}
                            onChange={(val) => {
                              const updated = [...data.paragraphs];
                              updated[i] = val;
                              setData({ ...data, paragraphs: updated });
                            }}
                          />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Padding Top Slider for About */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Top (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingTop: setResponsiveValue(data.paddingTop, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Bottom (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingBottom: setResponsiveValue(data.paddingBottom, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Chỉnh khoảng cách phía dưới Section About.</p>
                </div>
              </div>
            </div>
          )}

          {sectionId === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 space-y-8">
                <RichTextEditor
                  label="Heading"
                  value={data.heading}
                  onChange={(val) => setData({ ...data, heading: val })}
                />
                
                <RichTextEditor
                  label="Subtitle"
                  value={data.subtitle}
                  onChange={(val) => setData({ ...data, subtitle: val })}
                />
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

          {sectionId === 'gallery' && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm italic py-4">
                Cấu hình hiển thị cho section Dự án.
              </p>

              {/* Padding Top Slider for Gallery */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Top (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingTop: setResponsiveValue(data.paddingTop, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Bottom (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingBottom: setResponsiveValue(data.paddingBottom, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Chỉnh khoảng cách phía dưới Section này.</p>
                </div>
              </div>

              {/* Items to Show */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số lượng hiển thị (D:16, T:6, M:4)</label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '4' : globalPreviewMode === 'tablet' ? '6' : '16')} bài
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '4' : globalPreviewMode === 'tablet' ? '6' : '16')}
                    onChange={(e) => setData({ ...data, itemsToShow: setResponsiveValue(data.itemsToShow, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* See All Button */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nút Xem tất cả</label>
                  <button
                    onClick={() => setData({ ...data, showSeeAll: !data.showSeeAll })}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      data.showSeeAll ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showSeeAll ? "ĐANG HIỆN" : "ĐANG ẨN"}
                  </button>
                </div>
                
                {data.showSeeAll && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Nhãn nút</label>
                      <input
                        type="text"
                        value={data.seeAllLabel || 'Xem tất cả dự án'}
                        onChange={(e) => setData({ ...data, seeAllLabel: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                        placeholder="Xem tất cả..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Đường dẫn</label>
                      <input
                        type="text"
                        value={data.seeAllLink || '/projects'}
                        onChange={(e) => setData({ ...data, seeAllLink: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                        placeholder="/projects"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {sectionId === 'blog' && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm italic py-4">
                Cấu hình hiển thị cho section Blog.
              </p>

              {/* Grid Columns Controller */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số cột hiển thị (Desktop)</label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {data.columns || 3} cột
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={data.columns || 3}
                    onChange={(e) => setData({ ...data, columns: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic mt-1">Ghi chú: Mobile & Tablet sẽ luôn hiển thị 1 cột để đảm bảo trải nghiệm.</p>
                </div>
              </div>

              {/* Padding Top Slider for Blog */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Top (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingTop: setResponsiveValue(data.paddingTop, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Bottom (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    value={getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingBottom: setResponsiveValue(data.paddingBottom, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Chỉnh khoảng cách phía dưới Section này.</p>
                </div>
              </div>
              {/* Items to Show for Blog */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số lượng hiển thị (D:3, T:3, M:3)</label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '3' : globalPreviewMode === 'tablet' ? '3' : '3')} bài
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '3' : globalPreviewMode === 'tablet' ? '3' : '3')}
                    onChange={(e) => setData({ ...data, itemsToShow: setResponsiveValue(data.itemsToShow, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* See All Button for Blog */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nút Xem tất cả</label>
                  <button
                    onClick={() => setData({ ...data, showSeeAll: !data.showSeeAll })}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      data.showSeeAll ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {data.showSeeAll ? "ĐANG HIỆN" : "ĐANG ẨN"}
                  </button>
                </div>
                
                {data.showSeeAll && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Nhãn nút</label>
                      <input
                        type="text"
                        value={data.seeAllLabel || 'Xem tất cả bài viết'}
                        onChange={(e) => setData({ ...data, seeAllLabel: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                        placeholder="Xem tất cả..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Đường dẫn</label>
                      <input
                        type="text"
                        value={data.seeAllLink || '/blog'}
                        onChange={(e) => setData({ ...data, seeAllLink: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                        placeholder="/blog"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <div className="space-y-6">
                  <RichTextEditor
                    label="Tiêu đề"
                    value={data.data?.title}
                    onChange={(val) => handleBlockDataChange({ title: val })}
                  />
                  <RichTextEditor
                    label="Nội dung"
                    value={data.data?.content}
                    onChange={(val) => handleBlockDataChange({ content: val })}
                  />
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
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
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

        <div className="p-6 border-t border-zinc-800 bg-zinc-950 shrink-0 flex justify-end gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('previewUpdate', { detail: { sectionId, data: initialData } }));
              onClose();
            }}
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
