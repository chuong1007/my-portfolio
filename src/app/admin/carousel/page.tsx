"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Trash2, ArrowUp, ArrowDown, Monitor, Smartphone, Tablet } from "lucide-react";
import { HeroIntroCarousel } from "@/components/sections/HeroIntroCarousel";
import { GlobalPreviewWrapper } from "@/app/GlobalPreviewWrapper";
import { compressImage } from "@/lib/compressImage";

interface CarouselImage {
  id: string;
  url: string;
}

export default function AdminCarousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [tiltDirection, setTiltDirection] = useState<"inward" | "outward">("inward");
  type ConfigMode = "inward" | "outward" | "inward-reverse-scale";
  
  const defaultConfig = {
    gap: 16,
    perspective: 1.5,
    dTheta: 14,
    wCard: 260,
    blurStrength: 1.0,
    dimStrength: 1.0,
    displayCount: 7
  };

  const [configs, setConfigs] = useState<Record<ConfigMode, typeof defaultConfig>>({
    "inward": { ...defaultConfig },
    "outward": { ...defaultConfig, gap: 20, perspective: 2.0 },
    "inward-reverse-scale": { ...defaultConfig, gap: 10, dTheta: 12 }
  });

  const activeConfig = configs[tiltDirection];
  
  const updateConfig = (key: keyof typeof defaultConfig, value: number) => {
    setConfigs(prev => ({
      ...prev,
      [tiltDirection]: {
        ...prev[tiltDirection],
        [key]: value
      }
    }));
  };
  
  // History for Undo/Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = () => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(configs);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex >= 0) {
      if (historyIndex === history.length - 1 && history.length > 0) {
        // We are at current state, push current before moving back
        const current = configs;
        const nextHistory = [...history, current];
        setHistory(nextHistory);
        const prev = nextHistory[historyIndex];
        applyState(prev);
        setHistoryIndex(historyIndex);
      } else {
        const prev = history[historyIndex];
        applyState(prev);
        setHistoryIndex(historyIndex - 1);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      applyState(next);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const applyState = (state: any) => {
    setConfigs(state);
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await createClient()
        .from("site_content")
        .select("data")
        .eq("id", "hero_carousel")
        .single();
        
      if (data && data.data) {
        if (Array.isArray(data.data.images)) setImages(data.data.images);
        if (data.data.tiltDirection) setTiltDirection(data.data.tiltDirection);
        if (data.data.configs) {
          setConfigs(data.data.configs);
        } else {
          // Fallback for old flat data
          const fallback = { ...defaultConfig };
          if (data.data.gap !== undefined) fallback.gap = data.data.gap;
          if (data.data.perspective !== undefined) fallback.perspective = data.data.perspective;
          if (data.data.dTheta !== undefined) fallback.dTheta = data.data.dTheta;
          if (data.data.w_card !== undefined) fallback.wCard = data.data.w_card;
          if (data.data.blurStrength !== undefined) fallback.blurStrength = data.data.blurStrength;
          if (data.data.dimStrength !== undefined) fallback.dimStrength = data.data.dimStrength;
          if (data.data.displayCount !== undefined) fallback.displayCount = data.data.displayCount;
          setConfigs({
            "inward": { ...fallback },
            "outward": { ...fallback },
            "inward-reverse-scale": { ...fallback }
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await createClient()
        .from("site_content")
        .upsert({ id: "hero_carousel", data: { images, tiltDirection, configs } });
        
      if (error) throw error;
      showToast("Đã lưu thành công!", "success");
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

    const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const newImages: CarouselImage[] = [];
      for (const file of files) {
        // Nén ảnh HD sắc nét
        const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85, maxSizeMB: 1 });
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const supabaseClient = createClient();
        const { data, error } = await supabaseClient.storage.from("project-images").upload(`carousel/${filename}`, compressed);
        if (error) throw error;
        
        const { data: { publicUrl } } = supabaseClient.storage.from("project-images").getPublicUrl(`carousel/${filename}`);
        newImages.push({ id: Date.now().toString() + Math.random(), url: publicUrl });
      }
      setImages(prev => [...prev, ...newImages]);
    } catch (error: any) {
      showToast("Lỗi upload: " + error.message, "error");
    } finally {
      setUploading(false);
      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    setImages([...images, { id: Date.now().toString(), url: newUrl.trim() }]);
    setNewUrl("");
  };

  const handleRemove = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newImgs = [...images];
    const temp = newImgs[index - 1];
    newImgs[index - 1] = newImgs[index];
    newImgs[index] = temp;
    setImages(newImgs);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImgs = [...images];
    const temp = newImgs[index + 1];
    newImgs[index + 1] = newImgs[index];
    newImgs[index] = temp;
    setImages(newImgs);
  };

  const previewProjects = images.map(img => ({
    id: img.id,
    title: "Preview",
    imageUrl: img.url,
  }));

  const handleReplay = () => {
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-white pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Quản lý Carousel Trang chủ</h1>
          <p className="text-zinc-400 mt-2">Tuỳ chỉnh không giới hạn ảnh và thứ tự cho hiệu ứng lướt 3D</p>
        </div>
        <div className="flex items-center gap-4">
          {toast && (
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-right-5 fade-in duration-300 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-lg font-bold hover:bg-white disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột Quản lý */}
        <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Thêm ảnh mới</h2>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Đang nén và tải ảnh lên...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Plus className="w-10 h-10 text-zinc-500 mb-2" />
                  <p className="text-zinc-300 font-medium mb-1">Kéo thả ảnh vào đây</p>
                  <p className="text-zinc-500 text-sm mb-4">Hoặc click để chọn file (Hỗ trợ upload nhiều ảnh cùng lúc)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileSelect}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Chọn file
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Hoặc nhập URL ảnh trực tiếp..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-500"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
              />
              <button onClick={handleAddUrl} className="bg-zinc-800 hover:bg-zinc-700 px-4 rounded-lg transition-colors font-medium">
                Thêm URL
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách ảnh ({images.length})</h2>
            {loading ? (
              <div className="text-zinc-500">Đang tải...</div>
            ) : images.length === 0 ? (
              <div className="text-zinc-500 italic">Chưa có ảnh nào.</div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <img src={img.url} className="w-12 h-16 object-cover rounded bg-zinc-900" alt="" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-zinc-400 truncate">{img.url}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1} className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemove(img.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-lg font-bold">Live Preview</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleReplay} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg font-medium mr-2">
                Replay Animation
              </button>
              <button 
                onClick={() => setTiltDirection(prev => prev === 'inward' ? 'outward' : prev === 'outward' ? 'inward-reverse-scale' : 'inward')}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors ml-4"
              >
                Nghiêng: {tiltDirection === 'inward' ? 'Hướng xen kẽ (Inward)' : tiltDirection === 'outward' ? 'Hướng ra (Outward)' : 'Lớn dần ra ngoài'}
              </button>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded ${previewMode === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>
                  <Monitor className="w-4 h-4" />
                </button>
                <button onClick={() => setPreviewMode("tablet")} className={`p-1.5 rounded ${previewMode === "tablet" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>
                  <Tablet className="w-4 h-4" />
                </button>
                <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded ${previewMode === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden" style={{ height: "600px" }}>
            <div 
              className={`relative bg-zinc-950 overflow-hidden transition-all duration-300 border border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] origin-center flex-shrink-0 ${
                previewMode === "mobile" ? "w-[375px] h-[812px] rounded-[3rem] scale-[0.65]" : 
                previewMode === "tablet" ? "w-[768px] h-[1024px] rounded-3xl scale-[0.5]" : 
                "w-[1440px] h-[900px] rounded-2xl scale-[0.4]"
              }`}
            >
              <HeroIntroCarousel key={previewKey} projects={previewProjects} onComplete={() => {}} isAdminPreview={true} deviceMode={previewMode} tiltDirection={tiltDirection} gap={activeConfig.gap} perspectiveMultiplier={activeConfig.perspective} dTheta={activeConfig.dTheta} w_card={activeConfig.wCard} blurStrength={activeConfig.blurStrength} dimStrength={activeConfig.dimStrength} displayCount={activeConfig.displayCount} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <span>Cấu hình 3D ({tiltDirection === 'inward' ? 'Hướng xen kẽ' : tiltDirection === 'outward' ? 'Hướng ra' : 'Lớn dần ra ngoài'})</span>
                <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                  <button onClick={handleUndo} disabled={history.length === 0 || (historyIndex <= 0 && history.length > 1)} className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent" title="Undo">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  </button>
                  <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent" title="Redo">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { saveToHistory(); updateConfig('perspective', 2.5); updateConfig('dTheta', 8); updateConfig('gap', 20); updateConfig('blurStrength', 0.6); updateConfig('dimStrength', 0.6); updateConfig('displayCount', 7); }} className="px-3 py-1.5 bg-zinc-800 text-xs rounded hover:bg-zinc-700 font-medium">Subtle</button>
                <button onClick={() => { saveToHistory(); updateConfig('perspective', 1.5); updateConfig('dTheta', 14); updateConfig('gap', 16); updateConfig('blurStrength', 1); updateConfig('dimStrength', 1); updateConfig('displayCount', 7); }} className="px-3 py-1.5 bg-zinc-800 text-xs rounded hover:bg-zinc-700 font-medium">Default</button>
                <button onClick={() => { saveToHistory(); updateConfig('perspective', 1.0); updateConfig('dTheta', 18); updateConfig('gap', 14); updateConfig('blurStrength', 1.2); updateConfig('dimStrength', 1.2); updateConfig('displayCount', 7); }} className="px-3 py-1.5 bg-zinc-800 text-xs rounded hover:bg-zinc-700 font-medium">Deep</button>
                <button onClick={() => { saveToHistory(); updateConfig('perspective', 0.8); updateConfig('dTheta', 22); updateConfig('gap', 12); updateConfig('blurStrength', 1.5); updateConfig('dimStrength', 1.5); updateConfig('displayCount', 9); }} className="px-3 py-1.5 bg-zinc-800 text-xs rounded hover:bg-zinc-700 font-medium">Dramatic</button>
              </div>
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Space Padding (Khoảng cách giữa các thẻ)</label>
                    <span className="text-sm font-medium">{activeConfig.gap}px</span>
                  </div>
                  <input type="range" min="0" max="80" step="1" value={activeConfig.gap} onPointerDown={saveToHistory} onChange={(e) => updateConfig("gap", parseInt(e.target.value))} className="w-full accent-white" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Độ sâu Perspective (Multiplier)</label>
                    <span className="text-sm font-medium">{activeConfig.perspective}x</span>
                  </div>
                  <input type="range" min="0.5" max="3" step="0.1" value={activeConfig.perspective} onPointerDown={saveToHistory} onChange={(e) => updateConfig("perspective", parseFloat(e.target.value))} className="w-full accent-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Số lượng thẻ hiển thị</label>
                    <span className="text-sm font-medium">{activeConfig.displayCount} thẻ</span>
                  </div>
                  <input type="range" min="3" max="9" step="2" value={activeConfig.displayCount} onPointerDown={saveToHistory} onChange={(e) => updateConfig("displayCount", parseInt(e.target.value))} className="w-full accent-white" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Độ cong vòng cung (dTheta)</label>
                    <span className="text-sm font-medium">{activeConfig.dTheta}°</span>
                  </div>
                  <input type="range" min="4" max="24" step="0.5" value={activeConfig.dTheta} onPointerDown={saveToHistory} onChange={(e) => updateConfig("dTheta", parseFloat(e.target.value))} className="w-full accent-white" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Chiều rộng thẻ (Width)</label>
                    <span className="text-sm font-medium">{activeConfig.wCard}px</span>
                  </div>
                  <input type="range" min="160" max="360" step="4" value={activeConfig.wCard} onPointerDown={saveToHistory} onChange={(e) => updateConfig("wCard", parseInt(e.target.value))} className="w-full accent-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Cường độ Blur</label>
                    <span className="text-sm font-medium">{activeConfig.blurStrength}x</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.05" value={activeConfig.blurStrength} onPointerDown={saveToHistory} onChange={(e) => updateConfig("blurStrength", parseFloat(e.target.value))} className="w-full accent-white" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-zinc-400">Cường độ Tối (Dim)</label>
                    <span className="text-sm font-medium">{activeConfig.dimStrength}x</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.05" value={activeConfig.dimStrength} onPointerDown={saveToHistory} onChange={(e) => updateConfig("dimStrength", parseFloat(e.target.value))} className="w-full accent-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
