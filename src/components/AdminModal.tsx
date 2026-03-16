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
  Image as LucideImage,
  Phone,
  Mail,
  Facebook,
  MessageSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { RichTextEditor, type RichTextData } from "./RichTextEditor";
import { cn } from "@/lib/utils";
import { SketchPicker } from "react-color";
import { useAdmin } from "@/context/AdminContext";
import { getResponsiveValue, setResponsiveValue, type DeviceMode, type ResponsiveValue } from "@/lib/responsive-helpers";

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

const normalize = (val: any): RichTextData => {
  const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
  const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
  
  if (typeof val === 'object' && val !== null && 'content' in val) {
    return {
      ...val,
      fontSize: val.fontSize || defaultFS,
      lineHeight: val.lineHeight || defaultLH
    };
  }
  return { 
    content: val || '', 
    fontSize: defaultFS,
    lineHeight: defaultLH
  };
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
    // Generic normalizer for responsive values
    const normResp = (val: any, fallback: any = ''): any => {
      if (typeof val === 'object' && val !== null && ('mobile' in val || 'tablet' in val || 'desktop' in val)) return val;
      return { mobile: val || fallback, tablet: val || fallback, desktop: val || fallback };
    };

    setData({
      ...initialData,
      title: normalize(initialData?.title),
      subtitle: normalize(initialData?.subtitle),
      heading: normalize(initialData?.heading),
      subheading: normalize(initialData?.subheading),
      paragraphs: Array.isArray(initialData?.paragraphs) ? initialData.paragraphs.map((p: any) => normalize(p)) : [],
      
      // Responsive identity fields
      phone: normResp(initialData?.phone, ''),
      email: normResp(initialData?.email, ''),
      facebook: normResp(initialData?.facebook, ''),
      facebookLabel: normResp(initialData?.facebookLabel, 'Visit Profile'),
      showFacebook: normResp(initialData?.showFacebook, true),
      zalo: normResp(initialData?.zalo, ''),
      zaloLabel: normResp(initialData?.zaloLabel, 'Chat on Zalo'),
      showZalo: normResp(initialData?.showZalo, true),
      showPhone: normResp(initialData?.showPhone, true),
      showEmail: normResp(initialData?.showEmail, true),
      isVisible: normResp(initialData?.isVisible, true),

      // Logo settings
      logoType: normResp(initialData?.logoType, 'text'),
      logoText: normResp(initialData?.logoText, 'CHUONG.GRAPHIC'),
      logoColor: normResp(initialData?.logoColor, '#FFFFFF'),
      logoImageUrl: normResp(initialData?.logoImageUrl, ''),

      // For UX Builder Blocks
      type: initialData?.type || 'text',
      span: initialData?.span || 12,
      data: initialData?.data || { title: normalize(''), content: normalize('') },
      
      // Gallery/Blog settings
      columns: normResp(initialData?.columns, { mobile: 1, tablet: 2, desktop: 3 }),
      itemsToShow: normResp(initialData?.itemsToShow, { mobile: 4, tablet: 6, desktop: 16 }),
      seeAllLink: normResp(initialData?.seeAllLink, ''),
      seeAllLabel: normResp(initialData?.seeAllLabel, ''),
      showSeeAll: normResp(initialData?.showSeeAll, false),
      seeAllPosition: normResp(initialData?.seeAllPosition, 'bottom'),
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

      setData({ 
        ...data, 
        logoImageUrl: setResponsiveValue(data.logoImageUrl, globalPreviewMode, publicUrl) 
      });
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
    
    try {
      const supabase = createClient();
      const finalData = { ...data };
      
      // Normalize Facebook link
      if (finalData.facebook && typeof finalData.facebook === 'string' && !finalData.facebook.startsWith('http')) {
        finalData.facebook = `https://${finalData.facebook}`;
      }

      console.log("Saving payload for section:", sectionId, finalData);

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
    } catch (err) {
      console.error("Critical Save Error:", err);
      setError(`Lỗi hệ thống: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
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
                    onClick={() => setData({ ...data, logoType: setResponsiveValue(data.logoType, globalPreviewMode, 'text') })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      (getResponsiveValue(data.logoType, globalPreviewMode) || 'text') === 'text' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Text Logo
                  </button>
                  <button
                    onClick={() => setData({ ...data, logoType: setResponsiveValue(data.logoType, globalPreviewMode, 'image') })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      getResponsiveValue(data.logoType, globalPreviewMode) === 'image' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Image Logo
                  </button>
                </div>

                {(getResponsiveValue(data.logoType, globalPreviewMode) || 'text') === 'text' ? (
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
                            <div className="w-6 h-6 rounded-md shadow-sm border border-zinc-700" style={{ backgroundColor: getResponsiveValue(data.logoColor, globalPreviewMode) || '#FFFFFF' }} />
                            <span className="text-sm font-mono text-zinc-300">{getResponsiveValue(data.logoColor, globalPreviewMode) || '#FFFFFF'}</span>
                          </div>
                          <Palette className="w-4 h-4 text-zinc-500" />
                        </button>
                        
                        {showColorPicker && (
                          <div className="absolute top-14 left-0 z-50">
                            <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                            <div className="relative z-10 p-2 bg-[#1a1a1a] border border-[#222] rounded-xl shadow-2xl">
                              <SketchPicker
                                color={getResponsiveValue(data.logoColor, globalPreviewMode) || '#FFFFFF'}
                                onChange={(color) => setData({ ...data, logoColor: setResponsiveValue(data.logoColor, globalPreviewMode, color.hex) })}
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
                            value={getResponsiveValue(data.logoImageUrl, globalPreviewMode) || ''}
                            placeholder="https://path-to-your-logo.png"
                            onChange={(e) => setData({ ...data, logoImageUrl: setResponsiveValue(data.logoImageUrl, globalPreviewMode, e.target.value) })}
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
                              src={getResponsiveValue(data.logoImageUrl, globalPreviewMode)} 
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
                  enterAsBreak={true}
                />
              </div>

              {/* Font sizes are now controlled inside RichTextEditor */}

              {/* Sliders for Max Width & Padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scroll Button Offset (px)</label>
                    <span className="text-xs font-mono text-zinc-500">{getResponsiveValue(data.scrollOffset, globalPreviewMode) || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="500"
                    step="1"
                    value={getResponsiveValue(data.scrollOffset, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, scrollOffset: setResponsiveValue(data.scrollOffset, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Chỉnh vị trí nút kéo xuống (Margin Top).</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Top (px)</label>
                    <span className="text-xs font-mono text-zinc-500">{getResponsiveValue(data.paddingTop, globalPreviewMode) || 80}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1200"
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
                  enterAsBreak={true}
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
                    max="1200"
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
                    max="1200"
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
                    onClick={() => setData({ ...data, showPhone: setResponsiveValue(data.showPhone, globalPreviewMode, !(getResponsiveValue(data.showPhone, globalPreviewMode) !== false)) })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      getResponsiveValue(data.showPhone, globalPreviewMode) !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showPhone, globalPreviewMode) !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {getResponsiveValue(data.showPhone, globalPreviewMode) !== false ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <input
                  type="text"
                  value={getResponsiveValue(data.phone, globalPreviewMode)}
                  onChange={(e) => setData({ ...data, phone: setResponsiveValue(data.phone, globalPreviewMode, e.target.value) })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Email</label>
                  <button
                    onClick={() => setData({ ...data, showEmail: setResponsiveValue(data.showEmail, globalPreviewMode, !(getResponsiveValue(data.showEmail, globalPreviewMode) !== false)) })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      getResponsiveValue(data.showEmail, globalPreviewMode) !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showEmail, globalPreviewMode) !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {getResponsiveValue(data.showEmail, globalPreviewMode) !== false ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <input
                  type="text"
                  value={getResponsiveValue(data.email, globalPreviewMode)}
                  onChange={(e) => setData({ ...data, email: setResponsiveValue(data.email, globalPreviewMode, e.target.value) })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-3">
                 <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-500 font-medium">Kết nối Facebook</label>
                  <button
                    onClick={() => setData({ ...data, showFacebook: setResponsiveValue(data.showFacebook, globalPreviewMode, !getResponsiveValue(data.showFacebook, globalPreviewMode)) })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      getResponsiveValue(data.showFacebook, globalPreviewMode) ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showFacebook, globalPreviewMode) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {getResponsiveValue(data.showFacebook, globalPreviewMode) ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={getResponsiveValue(data.facebook, globalPreviewMode) || ''}
                      onChange={(e) => setData({ ...data, facebook: setResponsiveValue(data.facebook, globalPreviewMode, e.target.value) })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Link Facebook (https://...)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={getResponsiveValue(data.facebookLabel, globalPreviewMode) || ''}
                      onChange={(e) => setData({ ...data, facebookLabel: setResponsiveValue(data.facebookLabel, globalPreviewMode, e.target.value) })}
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
                    onClick={() => setData({ ...data, showZalo: setResponsiveValue(data.showZalo, globalPreviewMode, !getResponsiveValue(data.showZalo, globalPreviewMode)) })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                      getResponsiveValue(data.showZalo, globalPreviewMode) ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showZalo, globalPreviewMode) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {getResponsiveValue(data.showZalo, globalPreviewMode) ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={getResponsiveValue(data.zalo, globalPreviewMode) || ''}
                      onChange={(e) => setData({ ...data, zalo: setResponsiveValue(data.zalo, globalPreviewMode, e.target.value) })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Zalo (Số điện thoại hoặc Link)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={getResponsiveValue(data.zaloLabel, globalPreviewMode) || ''}
                      onChange={(e) => setData({ ...data, zaloLabel: setResponsiveValue(data.zaloLabel, globalPreviewMode, e.target.value) })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                      placeholder="Nhãn (VD: Nhắn Zalo)"
                    />
                  </div>
                </div>
              </div>
              
              {/* Padding Sliders for Contact */}
              <div className="col-span-1 md:col-span-2 p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-6">
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
                    max="1200"
                    step="1"
                    value={getResponsiveValue(data.paddingTop, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingTop: setResponsiveValue(data.paddingTop, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Padding Bottom (px)</label>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="1"
                    value={getResponsiveValue(data.paddingBottom, globalPreviewMode) || "0"}
                    onChange={(e) => setData({ ...data, paddingBottom: setResponsiveValue(data.paddingBottom, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {sectionId === 'gallery' && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm italic py-4">
                Cấu hình hiển thị cho section Dự án.
              </p>
              <RichTextEditor
                label="Tiêu đề Section"
                value={data.title}
                onChange={(val) => setData({ ...data, title: val })}
              />
              <RichTextEditor
                label="Mô tả Section"
                value={data.subtitle}
                onChange={(val) => setData({ ...data, subtitle: val })}
              />

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
                    max="1200"
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
                    max="1200"
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
                    max="100"
                    step="1"
                    value={getResponsiveValue(data.itemsToShow, globalPreviewMode) || "16"}
                    onChange={(e) => setData({ ...data, itemsToShow: setResponsiveValue(data.itemsToShow, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[9px] text-zinc-500 italic">Chỉnh số lượng dự án hiển thị trên mỗi giao diện.</p>
                </div>
              </div>

              {/* Column Slider for Gallery */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số cột hiển thị ({DEVICE_LABELS[globalPreviewMode]})</label>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {getResponsiveValue(data.columns, globalPreviewMode) || "3"} cột
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={getResponsiveValue(data.columns, globalPreviewMode) || "3"}
                  onChange={(e) => setData({ ...data, columns: setResponsiveValue(data.columns, globalPreviewMode, e.target.value) })}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-zinc-500 italic">Số lượng cột hiển thị trên {DEVICE_LABELS[globalPreviewMode]} (1-4).</p>
              </div>

              {/* See All Button */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-4">
                 <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nút Xem tất cả</label>
                  <button
                    onClick={() => setData({ ...data, showSeeAll: setResponsiveValue(data.showSeeAll, globalPreviewMode, !getResponsiveValue(data.showSeeAll, globalPreviewMode)) })}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      getResponsiveValue(data.showSeeAll, globalPreviewMode) ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showSeeAll, globalPreviewMode) ? "ĐANG HIỆN" : "ĐANG ẨN"}
                  </button>
                </div>
                
                {getResponsiveValue(data.showSeeAll, globalPreviewMode) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Nhãn nút</label>
                        <input
                          type="text"
                          value={getResponsiveValue(data.seeAllLabel, globalPreviewMode) || 'Xem tất cả dự án'}
                          onChange={(e) => setData({ ...data, seeAllLabel: setResponsiveValue(data.seeAllLabel, globalPreviewMode, e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                          placeholder="Xem tất cả..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Đường dẫn</label>
                        <input
                          type="text"
                          value={getResponsiveValue(data.seeAllLink, globalPreviewMode) || '/projects'}
                          onChange={(e) => setData({ ...data, seeAllLink: setResponsiveValue(data.seeAllLink, globalPreviewMode, e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                          placeholder="/projects"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Vị trí nút ({DEVICE_LABELS[globalPreviewMode]})</label>
                       <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => setData({ ...data, seeAllPosition: setResponsiveValue(data.seeAllPosition, globalPreviewMode, 'top') })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                            (getResponsiveValue(data.seeAllPosition, globalPreviewMode) || 'bottom') === 'top' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Cạnh tiêu đề
                        </button>
                        <button
                          onClick={() => setData({ ...data, seeAllPosition: setResponsiveValue(data.seeAllPosition, globalPreviewMode, 'bottom') })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                            (getResponsiveValue(data.seeAllPosition, globalPreviewMode) || 'bottom') === 'bottom' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Dưới cùng
                        </button>
                      </div>
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
              <RichTextEditor
                label="Tiêu đề Section"
                value={data.title}
                onChange={(val) => setData({ ...data, title: val })}
              />
              <RichTextEditor
                label="Mô tả Section"
                value={data.subtitle}
                onChange={(val) => setData({ ...data, subtitle: val })}
              />

              {/* Grid Columns Controller */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số cột hiển thị ({DEVICE_LABELS[globalPreviewMode]})</label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {getResponsiveValue(data.columns, globalPreviewMode) || "3"} cột
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={getResponsiveValue(data.columns, globalPreviewMode) || "3"}
                    onChange={(e) => setData({ ...data, columns: setResponsiveValue(data.columns, globalPreviewMode, e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 italic mt-1">Ghi chú: Chỉnh số cột hiển thị trên {DEVICE_LABELS[globalPreviewMode]} (1-4).</p>
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
                    max="1200"
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
                    max="1200"
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Số lượng hiển thị (D:3, T:6, M:5)</label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '5' : globalPreviewMode === 'tablet' ? '6' : '3')} bài
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={getResponsiveValue(data.itemsToShow, globalPreviewMode) || (globalPreviewMode === 'mobile' ? '5' : globalPreviewMode === 'tablet' ? '6' : '3')}
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
                    onClick={() => setData({ ...data, showSeeAll: setResponsiveValue(data.showSeeAll, globalPreviewMode, !getResponsiveValue(data.showSeeAll, globalPreviewMode)) })}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      getResponsiveValue(data.showSeeAll, globalPreviewMode) ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {getResponsiveValue(data.showSeeAll, globalPreviewMode) ? "ĐANG HIỆN" : "ĐANG ẨN"}
                  </button>
                </div>
                
                {getResponsiveValue(data.showSeeAll, globalPreviewMode) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Nhãn nút</label>
                        <input
                          type="text"
                          value={getResponsiveValue(data.seeAllLabel, globalPreviewMode) || 'Xem tất cả bài viết'}
                          onChange={(e) => setData({ ...data, seeAllLabel: setResponsiveValue(data.seeAllLabel, globalPreviewMode, e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                          placeholder="Xem tất cả..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Đường dẫn</label>
                        <input
                          type="text"
                          value={getResponsiveValue(data.seeAllLink, globalPreviewMode) || '/blog'}
                          onChange={(e) => setData({ ...data, seeAllLink: setResponsiveValue(data.seeAllLink, globalPreviewMode, e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-zinc-500 outline-none"
                          placeholder="/blog"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Vị trí nút ({DEVICE_LABELS[globalPreviewMode]})</label>
                       <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => setData({ ...data, seeAllPosition: setResponsiveValue(data.seeAllPosition, globalPreviewMode, 'top') })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                            (getResponsiveValue(data.seeAllPosition, globalPreviewMode) || 'bottom') === 'top' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Cạnh tiêu đề
                        </button>
                        <button
                          onClick={() => setData({ ...data, seeAllPosition: setResponsiveValue(data.seeAllPosition, globalPreviewMode, 'bottom') })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                            (getResponsiveValue(data.seeAllPosition, globalPreviewMode) || 'bottom') === 'bottom' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Dưới cùng
                        </button>
                      </div>
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
            onClick={() => setData({ ...data, isVisible: setResponsiveValue(data.isVisible, globalPreviewMode, !(getResponsiveValue(data.isVisible, globalPreviewMode) === true)) })}
            className={cn(
              "flex items-center gap-3 w-full p-4 rounded-2xl border transition-all duration-300",
              getResponsiveValue(data.isVisible, globalPreviewMode) === true 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                : "bg-zinc-800/30 border-zinc-800 text-zinc-500"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              getResponsiveValue(data.isVisible, globalPreviewMode) === true ? "bg-emerald-500/10" : "bg-zinc-800"
            )}>
              {getResponsiveValue(data.isVisible, globalPreviewMode) === true ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-bold">
                {getResponsiveValue(data.isVisible, globalPreviewMode) === true ? "Section đang hiện" : "Section đang ẩn"}
              </span>
              <span className="text-xs opacity-60">
                {getResponsiveValue(data.isVisible, globalPreviewMode) === true ? "Click để ẩn trên giao diện " + DEVICE_LABELS[globalPreviewMode] : "Click để hiện lại trên giao diện " + DEVICE_LABELS[globalPreviewMode]}
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
