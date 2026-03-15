"use client";

import { 
  Plus, 
  Trash2, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Briefcase, 
  ChevronRight, 
  Save, 
  Eye,
  EyeOff,
  PanelRight,
  Columns,
  Grid3X3,
  Square,
  LayoutGrid,
  Layers,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Smartphone,
  Monitor,
  Copy,
  Download,
  Edit2,
  Undo,
  Redo,
  UploadCloud
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBuilderStore, type BlockType, type RowData, type ColumnData, type BlockData, type ElementStyles, type ElementVisibility, type SelectedElement } from '@/store/useBuilderStore';
import { ContentBlock } from '@/components/builder/ContentBlocks';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { PageRenderer } from '@/components/builder/PageRenderer';

import { useAdmin } from '@/context/AdminContext';

export default function BuilderPage() {
  const { isAdmin, isEditMode, loading: adminLoading, toggleEditMode } = useAdmin();
  const router = useRouter();
  const [currentSlug, setCurrentSlug] = useState<string>('home');
  const { 
    pageData, 
    pagesList,
    fetchPagesList,
    createPage,
    updatePageMetadata,
    addRow, 
    removeRow, 
    updateRowLayout, 
    addColumn,
    removeColumn,
    addBlock, 
    removeBlock, 
    updateBlock,
    loadPage,
    savePage,
    selectedElement,
    selectElement: storeSelectElement,
    updateElementStyles,
    updateElementVisibility,
    saveAsTemplate,
    undo,
    redo,
    past,
    future
  } = useBuilderStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isBuilderActive, setIsBuilderActive] = useState(false);
  const [isPreviewingLocal, setIsPreviewingLocal] = useState(false);
  
  // Resizable sidebar states
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'components' | 'settings'>('components');

  // Inline editing for pages
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');

  // Wrapper for selectElement to also manage sidebarTab
  const selectElement = (element: SelectedElement | null) => {
    storeSelectElement(element);
    if (element) {
      setSidebarTab('settings');
    } else {
      setSidebarTab('components');
    }
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = document.documentElement.clientWidth - e.clientX;
      if (newWidth > 320 && newWidth < Math.min(800, document.documentElement.clientWidth * 0.8)) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const [showTemplateModal, setShowTemplateModal] = useState<'save' | 'library' | null>(null);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchPagesList();
  }, [fetchPagesList]);

  useEffect(() => {
    if (showTemplateModal === 'library') {
      const fetchTemplates = async () => {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        const { data } = await supabase.from('page_templates').select('*').order('created_at', { ascending: false });
        if (data) setTemplates(data);
      };
      fetchTemplates();
    }
  }, [showTemplateModal]);

  const { importTemplate } = useBuilderStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = params.get('page');
    const isBuilderFromUrl = params.get('builder') === 'true';

    if (pageFromUrl) {
      setCurrentSlug(pageFromUrl);
      loadPage(pageFromUrl);
    } else {
      loadPage('home');
    }

    if (isBuilderFromUrl) {
      setIsBuilderActive(true);
    }
  }, [loadPage]);

  // Turn off builder if edit mode is toggled off from header
  useEffect(() => {
    if (!isEditMode) {
      setIsBuilderActive(false);
    }
  }, [isEditMode]);

  const handleSave = async (isPublished: boolean = false) => {
    setIsSaving(true);
    const result = await savePage(currentSlug, isPublished);
    setIsSaving(false);
    if (result.success) {
      alert(isPublished ? "Xuất bản thành công! ✨" : "Lưu nháp thành công! 📝");
    } else {
      alert("Lỗi khi lưu: " + result.error);
    }
  };

  let currentVisibility: ElementVisibility = {};
  if (selectedElement) {
    if (selectedElement.type === 'row') {
      currentVisibility = pageData.find((r: RowData) => r.id === selectedElement.rowId)?.visibility || {};
    } else if (selectedElement.type === 'col' && selectedElement.colId) {
      const row = pageData.find((r: RowData) => r.id === selectedElement.rowId);
      currentVisibility = row?.columns.find((c: ColumnData) => c.id === selectedElement.colId)?.visibility || {};
    } else if (selectedElement.type === 'block' && selectedElement.blockId && selectedElement.colId) {
      const row = pageData.find((r: RowData) => r.id === selectedElement.rowId);
      const col = row?.columns.find((c: ColumnData) => c.id === selectedElement.colId);
      currentVisibility = col?.blocks.find((b: BlockData) => b.id === selectedElement.blockId)?.visibility || {};
    }
  }

  // --- GUEST VIEW (hoặc Admin Mode nhưng chưa bật Builder) ---
  if (!adminLoading && (!isAdmin || !isEditMode || !isBuilderActive)) {
    return (
      <main className="min-h-screen bg-black pt-24 relative">
        <div className="w-full">
          {pageData.length > 0 ? (
            <PageRenderer data={pageData} />
          ) : (
            <div className="flex items-center justify-center py-20 text-zinc-500">Loading page data...</div>
          )}
        </div>
        
        {/* Nút lơ lửng cho phép Admin bấm vào để bật Builder (Chỉ hiện khi đang ở Admin Mode) */}
        {isAdmin && isEditMode && !isBuilderActive && (
          <button
            onClick={() => setIsBuilderActive(true)}
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-white/10 transition-all font-bold text-sm bg-transparent text-white border border-white hover:text-blue-400 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 group"
          >
            <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            MỞ TRÌNH CHỈNH SỬA
          </button>
        )}
      </main>
    );
  }

  // --- ADMIN/BUILDER VIEW ---
  return (
    <div className="flex h-screen bg-black text-zinc-300 overflow-hidden font-sans pt-16">
      {/* AREA: CANVAS (LEFT) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] relative">
        <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-900/80 pt-8 pb-6 md:pt-12 md:pb-8 px-8 md:px-16 shadow-2xl transition-all">
          <div className="w-full flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-zinc-500 tracking-tighter uppercase drop-shadow-md">UX Builder</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-zinc-900 rounded-2xl border border-zinc-800 p-1 mr-4 shadow-xl">
                <button 
                  onClick={undo}
                  disabled={past.length === 0}
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 transition-all"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <div className="w-[1px] bg-zinc-800 mx-1" />
                <button 
                  onClick={redo}
                  disabled={future.length === 0}
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 transition-all"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
              {!showSidebar && (
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white group"
                  title="Open Sidebar"
                >
                  <PanelRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              )}
              <button
                onClick={() => {
                  const newPreviewState = !isPreviewingLocal;
                  setIsPreviewingLocal(newPreviewState);
                  setShowSidebar(!newPreviewState);
                }}
                className={cn("flex items-center gap-2 px-6 py-2.5 rounded-2xl border font-bold transition-all text-sm", isPreviewingLocal ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700 hover:border-blue-600" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white")}
              >
                {isPreviewingLocal ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreviewingLocal ? "Chỉnh Sửa lại" : "Lướt Xem Trước"}
              </button>
              <button 
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-zinc-800 border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition-all text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu Nháp
              </button>
              <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all text-sm shadow-2xl shadow-blue-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {isSaving ? "Publishing..." : "Xuất Bản"}
              </button>
            </div>
          </div>
        </header>

        <div className="w-full space-y-16 pb-64 pt-12">
          <div className="space-y-12">
            {pageData.map((row: RowData) => (
                  <section 
                    key={row.id} 
                    className={cn(
                      "group relative bg-zinc-900/10 rounded-[3rem] p-10 min-h-[200px] transition-all",
                      !isPreviewingLocal ? "border-2 border-zinc-800/40 hover:bg-zinc-900/20" : "border-2 border-transparent",
                      selectedElement?.type === 'row' && selectedElement.rowId === row.id && !isPreviewingLocal ? "border-blue-500/50" : "",
                      row.visibility?.hideOnMobile && "opacity-40",
                      row.visibility?.hideOnDesktop && "opacity-40"
                    )}
                    onClick={(e) => {
                      if (isPreviewingLocal) return;
                      e.stopPropagation();
                      selectElement({ type: 'row', rowId: row.id });
                    }}
                  >
                    {/* ROW TOOLS */}
                    {!isPreviewingLocal && (
                      <div className="absolute -right-4 -top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all bg-zinc-900 border border-zinc-800 p-2 rounded-2xl z-20 shadow-2xl">
                         <button onClick={(e) => { e.stopPropagation(); updateRowLayout(row.id, '1'); }} className="p-2 hover:bg-zinc-800 rounded-xl" title="1 cột">
                            <Square className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); updateRowLayout(row.id, '2'); }} className="p-2 hover:bg-zinc-800 rounded-xl" title="2 cột">
                            <Columns className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); updateRowLayout(row.id, '3'); }} className="p-2 hover:bg-zinc-800 rounded-xl" title="3 cột">
                            <Grid3X3 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); updateRowLayout(row.id, '4'); }} className="p-2 hover:bg-zinc-800 rounded-xl" title="4 cột">
                            <LayoutGrid className="w-4 h-4" />
                         </button>
                         <div className="w-px h-6 bg-zinc-800 mx-1" />
                         <button onClick={(e) => { e.stopPropagation(); removeRow(row.id); }} className="p-2 hover:bg-red-500/20 text-red-500/80 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-12 gap-10">
                      {row.columns.map((col: ColumnData) => (
                          <div 
                            key={col.id} 
                            className={cn(
                              "relative flex flex-col gap-6 p-4 rounded-2xl transition-all",
                              !isPreviewingLocal ? "border-2 border-dashed border-zinc-800/20 hover:border-zinc-800/50" : "border-2 border-transparent",
                              col.span === 12 ? "col-span-12" : col.span === 6 ? "col-span-6" : col.span === 4 ? "col-span-4" : "col-span-3",
                              selectedElement?.type === 'col' && selectedElement.colId === col.id && !isPreviewingLocal ? "border-blue-500/50 bg-blue-500/5" : "",
                              col.styles?.backgroundColor,
                              col.styles?.padding,
                              col.styles?.textAlign === 'center' ? 'text-center' : col.styles?.textAlign === 'right' ? 'text-right' : col.styles?.textAlign === 'justify' ? 'text-justify' : 'text-left'
                            )}
                            onClick={(e) => {
                              if (isPreviewingLocal) return;
                              e.stopPropagation();
                              selectElement({ type: 'col', rowId: row.id, colId: col.id });
                            }}
                          >
                            {/* BOCKS RENDERER */}
                            <div className="space-y-6">
                              {col.blocks.map((block: BlockData) => (
                                <div 
                                  key={block.id}
                                  className={cn(
                                    "relative transition-all rounded-2xl",
                                    !isPreviewingLocal ? "border-2 border-transparent hover:border-zinc-800/50" : "border-2 border-transparent",
                                    selectedElement?.type === 'block' && selectedElement.blockId === block.id && !isPreviewingLocal ? "border-blue-500/50 !border-2" : ""
                                  )}
                                  onClick={(e) => {
                                    if (isPreviewingLocal) return;
                                    e.stopPropagation();
                                    selectElement({ type: 'block', rowId: row.id, colId: col.id, blockId: block.id });
                                  }}
                                >
                                <ContentBlock 
                                  rowId={row.id}
                                  colId={col.id}
                                  block={block}
                                  onUpdate={(data: Partial<BlockData>) => updateBlock(row.id, col.id, block.id, data)}
                                  onRemove={() => removeBlock(row.id, col.id, block.id)}
                                  isPreviewingLocal={isPreviewingLocal}
                                />
                              </div>
                            ))}
                          </div>

                          {/* ADD BLOCK DROP ZONE */}
                            {!isPreviewingLocal && (
                              <div className="relative mt-auto pt-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === col.id ? null : col.id);
                                  }}
                                  className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 rounded-2xl flex items-center justify-center gap-3 text-zinc-600 hover:text-zinc-400 transition-all group/add"
                                >
                                  <Plus className="w-4 h-4 group-hover/add:scale-125 transition-transform" />
                                  <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Add Block</span>
                                </button>
  
                                {activeMenu === col.id && (
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 z-30 grid grid-cols-3 gap-1 shadow-2xl animate-in zoom-in-95 duration-200">
                                     {[
                                       { type: 'text' as BlockType, icon: Type, label: 'Text' },
                                       { type: 'image' as BlockType, icon: ImageIcon, label: 'Image' },
                                       { type: 'projects' as BlockType, icon: Briefcase, label: 'Project' }
                                     ].map(item => (
                                       <button 
                                        key={item.type}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addBlock(row.id, col.id, item.type);
                                          setActiveMenu(null);
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-white"
                                       >
                                         <item.icon className="w-5 h-5" />
                                         <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                                       </button>
                                     ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                      ))}
                    </div>
                  </section>
                ))}

                {!isPreviewingLocal && (
                  <button 
                    onClick={addRow}
                    className="w-full py-20 border-2 border-dashed border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-zinc-700 hover:text-zinc-500 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-[0.3em]">Create New Row</span>
                  </button>
                )}
          </div>
        </div>
      </div>

      {/* AREA: SIDEBAR (RIGHT) */}
      <aside 
        className={cn(
          "bg-zinc-950 border-l border-zinc-900 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40 relative overflow-hidden",
          showSidebar ? "opacity-100" : "w-0 opacity-0 border-none",
          !isResizing && "transition-all duration-300 ease-in-out"
        )}
        style={{ width: showSidebar ? `${sidebarWidth}px` : '0px' }}
      >
        {showSidebar && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500/80 z-50 transition-colors"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
        <div className="p-8 border-b border-zinc-900 flex items-center justify-between" style={{ minWidth: '320px' }}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarTab('components')}
              className={cn("font-bold uppercase tracking-[0.2em] text-xs transition-colors", sidebarTab === 'components' ? "text-white" : "text-zinc-600 hover:text-zinc-400")}
            >
              Components
            </button>
            <button 
              onClick={() => {
                if (selectedElement) setSidebarTab('settings');
              }}
              className={cn("font-bold uppercase tracking-[0.2em] text-xs transition-colors", sidebarTab === 'settings' ? "text-white" : "text-zinc-600 hover:text-zinc-400", !selectedElement && "opacity-50 cursor-not-allowed")}
            >
              Settings
            </button>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-zinc-900 rounded-xl transition-colors group"
          >
             <PanelRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar" style={{ minWidth: '320px' }}>
          {sidebarTab === 'components' ? (
            <>
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-bold text-zinc-600 tracking-[0.2em] px-1">Structure</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={addRow}
                    className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-zinc-800">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase tracking-tight">New Row</div>
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase font-medium">12-Column Grid</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* PAGES MANAGEMENT SECTION */}
              <div className="space-y-6 pt-6 border-t border-zinc-900/50">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] uppercase font-bold text-zinc-600 tracking-[0.2em]">Pages Management</h3>
                  <button 
                    onClick={() => setShowCreatePageModal(true)}
                    className="p-1 px-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-bold uppercase transition-all hover:bg-blue-500/20"
                  >
                    + New Page
                  </button>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {pagesList.map(page => (
                    <div 
                      key={page.id} 
                      className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all cursor-pointer group hover:bg-zinc-900/60"
                      onClick={() => {
                        if (confirm(`Chuyển sang chỉnh sửa trang /${page.slug}? Các thay đổi chưa lưu sẽ bị mất.`)) {
                          router.push(`/admin/builder?page=${page.slug}&builder=true`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {editingPageId === page.id ? (
                            <div className="space-y-2 w-full" onClick={e => e.stopPropagation()}>
                               <input 
                                 value={editTitle} 
                                 onChange={e => setEditTitle(e.target.value)} 
                                 className="w-full bg-zinc-950 border border-zinc-700 text-[11px] font-bold text-zinc-200 px-2 py-1.5 rounded-md focus:outline-none focus:border-blue-500" 
                               />
                               <div className="flex items-center">
                                 <span className="text-[9px] text-zinc-500 mr-1 font-mono">/</span>
                                 <input 
                                   value={editSlug} 
                                   onChange={e => setEditSlug(e.target.value)} 
                                   className="w-full bg-zinc-950 border border-zinc-700 text-[9px] font-mono text-zinc-500 px-2 py-1.5 rounded-md focus:outline-none focus:border-blue-500" 
                                 />
                               </div>
                               <div className="flex gap-2">
                                 <button 
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     updatePageMetadata(page.id, { title: editTitle, slug: editSlug });
                                     setEditingPageId(null); 
                                   }} 
                                   className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-[9px] text-white font-bold rounded-md transition-colors"
                                 >
                                   Lưu
                                 </button>
                                 <button 
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     setEditingPageId(null); 
                                   }} 
                                   className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[9px] text-zinc-300 font-bold rounded-md transition-colors"
                                 >
                                   Huỷ
                                 </button>
                               </div>
                            </div>
                          ) : (
                            <div className="relative w-full flex items-center justify-between">
                              <div className="truncate pr-8">
                                <span className="text-[11px] font-bold text-zinc-200 block truncate">{page.title}</span>
                                <span className="text-[9px] text-zinc-600 font-mono tracking-tighter block truncate">/{page.slug}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPageId(page.id);
                                  setEditTitle(page.title);
                                  setEditSlug(page.slug);
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-500 hover:text-blue-400 transition-all z-20 shadow-lg"
                                title="Chỉnh sửa tên và link"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingPageId !== page.id && (
                          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updatePageMetadata(page.id, { is_published: !page.is_published }); }}
                              className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors hover:bg-zinc-900 border border-transparent hover:border-zinc-800")}
                              title={page.is_published ? "Public" : "Draft"}
                            >
                              {page.is_published ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
                              <span className={cn("text-[8px] uppercase font-bold", page.is_published ? "text-blue-500" : "text-zinc-500")}>
                                {page.is_published ? "Public" : "Draft"}
                              </span>
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-800" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); updatePageMetadata(page.id, { show_in_header: !page.show_in_header }); }}
                              className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors hover:bg-zinc-900 border border-transparent hover:border-zinc-800")}
                              title={page.show_in_header ? "In Menu" : "Hidden from Menu"}
                            >
                              <Layers className={cn("w-3.5 h-3.5", page.show_in_header ? "text-green-500" : "text-zinc-500")} />
                              <span className={cn("text-[8px] uppercase font-bold", page.show_in_header ? "text-green-500" : "text-zinc-500")}>
                                {page.show_in_header ? "Menu" : "No Menu"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-bold text-zinc-600 tracking-[0.2em] px-1">Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowTemplateModal('save')}
                    className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 hover:border-blue-500/50 transition-all group"
                  >
                    <Copy className="w-5 h-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors">Save current</span>
                  </button>
                  <button 
                    onClick={() => setShowTemplateModal('library')}
                    className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 hover:border-purple-500/50 transition-all group"
                  >
                    <Download className="w-5 h-5 text-zinc-500 group-hover:text-purple-500 transition-colors" />
                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors">Library</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Editing: {selectedElement?.type || 'Element'}
                  </span>
                </div>
                <button onClick={() => setSidebarTab('components')} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold">Close</button>
              </div>

              {/* STYLING SECTION */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-white uppercase tracking-widest">Spacing (Padding)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: 'None', v: 'p-0' },
                      { l: 'Small', v: 'p-4' },
                      { l: 'Medium', v: 'p-10' },
                      { l: 'Large', v: 'p-20' }
                    ].map(p => (
                      <button 
                        key={p.v}
                        onClick={() => updateElementStyles({ padding: p.v })}
                        className="py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] font-bold hover:border-zinc-700 active:scale-95 transition-all uppercase tracking-tighter"
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>


                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-white uppercase tracking-widest">Background Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { l: 'None', v: 'transparent' },
                      { l: 'Dark', v: 'bg-zinc-900' },
                      { l: 'Glass', v: 'bg-white/5' },
                      { l: 'Blue', v: 'bg-blue-900/20' },
                      { l: 'Zinc', v: 'bg-zinc-950' }
                    ].map(bg => (
                      <button 
                        key={bg.v}
                        onClick={() => updateElementStyles({ backgroundColor: bg.v })}
                        title={bg.l}
                        className={cn("w-10 h-10 rounded-full border border-zinc-800 hover:scale-110 active:scale-90 transition-all", bg.v, bg.v === 'transparent' && "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]")}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RESPONSIVE VISIBILITY */}
              <div className="space-y-6 pt-10 border-t border-zinc-900">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Responsive Visibility</h4>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => updateElementVisibility({ hideOnMobile: !currentVisibility.hideOnMobile })}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all",
                      currentVisibility.hideOnMobile 
                        ? "bg-red-500/10 border-2 border-red-500/50 text-red-500" 
                        : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className={cn("w-4 h-4", currentVisibility.hideOnMobile ? "text-red-500" : "text-zinc-500")} />
                      <span className={cn("text-[11px] font-bold uppercase tracking-tighter", currentVisibility.hideOnMobile ? "text-red-500" : "text-zinc-400")}>Hide on Mobile</span>
                    </div>
                    {currentVisibility.hideOnMobile ? <EyeOff className="w-4 h-4 text-red-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
                  </button>
                  <button 
                    onClick={() => updateElementVisibility({ hideOnDesktop: !currentVisibility.hideOnDesktop })}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all",
                      currentVisibility.hideOnDesktop 
                        ? "bg-red-500/10 border-2 border-red-500/50 text-red-500" 
                        : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className={cn("w-4 h-4", currentVisibility.hideOnDesktop ? "text-red-500" : "text-zinc-500")} />
                      <span className={cn("text-[11px] font-bold uppercase tracking-tighter", currentVisibility.hideOnDesktop ? "text-red-500" : "text-zinc-400")}>Hide on Desktop</span>
                    </div>
                    {currentVisibility.hideOnDesktop ? <EyeOff className="w-4 h-4 text-red-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
                  </button>
                </div>
              </div>

              <div className="pt-20">
                <button 
                  onClick={() => {
                    if (selectedElement) {
                      if (selectedElement.type === 'row') removeRow(selectedElement.rowId);
                      if (selectedElement.type === 'col' && selectedElement.colId) removeColumn(selectedElement.rowId, selectedElement.colId);
                      if (selectedElement.type === 'block' && selectedElement.blockId && selectedElement.colId) removeBlock(selectedElement.rowId, selectedElement.colId, selectedElement.blockId);
                    }
                    selectElement(null);
                  }}
                  className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all"
                >
                  Delete {selectedElement?.type}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-zinc-900 space-y-4">
          <div className="text-center">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2">Built with Antigravity</p>
          </div>
        </div>
      </aside>

      {/* TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {showTemplateModal === 'save' ? <Copy className="w-5 h-5 text-blue-500" /> : <Download className="w-5 h-5 text-purple-500" />}
                {showTemplateModal === 'save' ? 'Lưu thành Template' : 'Thư viện Template'}
              </h3>
              <button 
                onClick={() => setShowTemplateModal(null)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
              </button>
            </div>

            <div className="p-6">
              {showTemplateModal === 'save' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-2 block">Tên Template</label>
                    <input 
                      type="text" 
                      placeholder="VD: Portfolio Header, Contact Section..." 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-700"
                    />
                  </div>
                  <button 
                    disabled={!templateName}
                    onClick={async () => {
                      const res = await saveAsTemplate(templateName);
                      if (res.success) {
                        alert('Đã lưu template thành công!');
                        setShowTemplateModal(null);
                        setTemplateName('');
                      } else {
                        alert('Lỗi: ' + res.error);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold p-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    Xác nhận Lưu
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.length === 0 ? (
                    <div className="py-10 text-center text-zinc-600 italic">Chưa có template nào được lưu.</div>
                  ) : (
                    templates.map((t) => (
                      <div 
                        key={t.id}
                        className="group flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer"
                        onClick={async () => {
                          if (confirm('Lưu ý: Nhập template sẽ thay thế toàn bộ thiết kế hiện tại. Tiếp tục?')) {
                            await importTemplate(t.id);
                            setShowTemplateModal(null);
                          }
                        }}
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{t.template_name}</div>
                          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
                            {new Date(t.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-zinc-700 group-hover:text-purple-400 transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* CREATE PAGE MODAL */}
      {showCreatePageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Create New Page
              </h3>
              <button 
                onClick={() => setShowCreatePageModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-widest text-zinc-500">Page Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Services, About Me..." 
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-widest text-zinc-500">URL Slug</label>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                  <span className="pl-4 text-zinc-600 text-sm font-mono">/</span>
                  <input 
                    type="text" 
                    placeholder="my-new-page" 
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full bg-transparent p-4 pl-1 text-white focus:outline-none"
                  />
                </div>
              </div>
              <button 
                disabled={!newPageTitle || !newPageSlug}
                onClick={async () => {
                  const res = await createPage(newPageTitle, newPageSlug);
                  if (res.success) {
                    alert('Page created successfully!');
                    setShowCreatePageModal(false);
                    setNewPageTitle('');
                    setNewPageSlug('');
                    loadPage(newPageSlug);
                  } else {
                    alert('Error: ' + res.error);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold p-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
