"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2, 
  Globe, 
  Menu as MenuIcon,
  Layout,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { useBuilderStore, type PageEntry } from "@/store/useBuilderStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminPagesManager() {
  const { 
    pagesList, 
    fetchPagesList, 
    createPage, 
    updatePageMetadata, 
    deletePage 
  } = useBuilderStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPagesList();
  }, [fetchPagesList]);

  const filteredPages = pagesList.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle || !newPageSlug) return;

    setIsSubmitting(true);
    const res = await createPage(newPageTitle, newPageSlug);
    setIsSubmitting(false);

    if (res.success) {
      setShowCreateModal(false);
      setNewPageTitle("");
      setNewPageSlug("");
    } else {
      alert("Lỗi khi tạo trang: " + res.error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa trang "${title}"? Thao tác này không thể hoàn tác.`)) {
      const res = await deletePage(id);
      if (!res.success) {
        alert("Lỗi khi xóa trang: " + res.error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50 shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" />
            Quản lý Trang
          </h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase font-bold tracking-widest">
            {pagesList.length} trang hiện có trên hệ thống
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-white/5"
        >
          <Plus className="w-5 h-5" />
          Tạo Trang Mới
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex items-center gap-4 bg-zinc-900/20 p-2 rounded-2xl border border-zinc-800/30">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Tìm kiếm trang theo tiêu đề hoặc đường dẫn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border-none pl-12 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-zinc-900/20 rounded-[2rem] border border-zinc-800/40 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 w-[40%]">Trang & Đường dẫn</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 text-center">Xuất bản</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 text-center">Menu Header</th>
                <th className="px-6 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 italic">
                    Không tìm thấy trang nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:text-blue-400 transition-all">
                          <Layout className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">
                            {page.title}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            /{page.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => updatePageMetadata(page.id, { is_published: !page.is_published })}
                        className={cn(
                          "w-10 h-10 rounded-full inline-flex items-center justify-center transition-all border",
                          page.is_published 
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-700"
                        )}
                        title={page.is_published ? "Đang hiển thị" : "Đã ẩn"}
                      >
                        {page.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => updatePageMetadata(page.id, { show_in_header: !page.show_in_header })}
                        className={cn(
                          "w-10 h-10 rounded-full inline-flex items-center justify-center transition-all border",
                          page.show_in_header 
                            ? "bg-green-500/10 border-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-700"
                        )}
                        title={page.show_in_header ? "Có trong Menu" : "Không hiện trong Menu"}
                      >
                        <MenuIcon className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-6 border-zinc-800">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/builder?page=${page.slug}&builder=true`}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-zinc-400 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-widest hidden lg:inline">Thiết kế</span>
                        </Link>
                        <a 
                          href={`/${page.slug}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all text-zinc-400"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDelete(page.id, page.title)}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-zinc-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PAGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3 text-sm">
                <Plus className="w-5 h-5 text-blue-500" />
                Thiết lập Trang Mới
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-zinc-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePage} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Tên Trang (Ví dụ: Dịch vụ, Blog...)</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nhập tiêu đề trang..." 
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">URL Slug (Đường dẫn tĩnh)</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-blue-500/50 transition-all">
                  <span className="pl-5 text-zinc-600 font-mono text-sm">/</span>
                  <input 
                    type="text" 
                    placeholder="my-new-page" 
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full bg-transparent p-5 pl-1 text-white focus:outline-none font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !newPageTitle || !newPageSlug}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create Page <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
