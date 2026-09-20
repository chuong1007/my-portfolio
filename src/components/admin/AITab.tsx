"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { AIKnowledgeRecord, AIKnowledgeCategory } from "@/lib/ai-constants";
import { AI_KNOWLEDGE_CATEGORIES } from "@/lib/ai-constants";
import { Plus, Tag, Trash2, Edit2, Check, X, Search, Filter, Play, BotMessageSquare, Monitor, Tablet, Smartphone, AlertTriangle } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";


const DEFAULT_KNOWLEDGE = [
  { category: 'Giới thiệu', question: 'Giới thiệu một chút về Chương được không?', answer: 'Chào anh/chị, em là AI của Trần Thanh Chương. Sếp em là một Senior Graphic / Web UI & Packaging Designer với hơn 7 năm kinh nghiệm thực chiến. Sếp chuyên trị việc xây dựng hình ảnh thương hiệu đa nền tảng, từ ấn phẩm truyền thông, bao bì sản phẩm cho đến giao diện Website.', keywords: ['chuong la ai', 'gioi thieu', 'ban la ai'], sort_order: 1, is_active: true },
  { category: 'Giới thiệu', question: 'Điểm khác biệt lớn nhất của Chương so với các Designer khác là gì?', answer: 'Điểm ăn tiền nhất của sếp em là sự kết hợp giữa Thẩm mỹ hiện đại và Tư duy chiến lược. Sếp không chỉ vẽ cho đẹp mà còn cực kỳ am hiểu tâm lý thị giác người dùng, giúp tối ưu tỷ lệ chuyển đổi cho sản phẩm.', keywords: ['the manh', 'diem khac biet', 'khac biet'], sort_order: 2, is_active: true },
  { category: 'Kỹ năng', question: 'Chương thường sử dụng những phần mềm nào?', answer: 'Về đồ hoạ, sếp em dùng thành thạo Photoshop và Illustrator. Về UI/UX thì sếp làm chủ Figma để bàn giao file mượt mà cho Lập trình viên. Về dựng video, sếp dùng Adobe Premiere và Capcut.', keywords: ['phan mem', 'tool', 'figma', 'photoshop', 'ky nang'], sort_order: 3, is_active: true },
  { category: 'Kỹ năng', question: 'Chương có bắt kịp công nghệ AI không?', answer: 'Chắc chắn rồi ạ! Sếp em luôn cập nhật xu hướng và đang ứng dụng rất hiệu quả các công cụ AI thế hệ mới vào quy trình thiết kế đồ hoạ và tạo video để đẩy nhanh tốc độ mà vẫn giữ chất lượng cao.', keywords: ['ai', 'cong nghe ai', 'ai tool'], sort_order: 4, is_active: true },
  { category: 'Kinh nghiệm', question: 'Kinh nghiệm làm việc thực tế của Chương thế nào?', answer: 'Sếp em có 7 năm chinh chiến. Từ 2/2020 đến nay sếp đang làm Freelancer mảng Web UI, Bao bì & Nhận diện thương hiệu. Trước đó, sếp từng làm Leader Team Graphic tại AZSEO (quản lý team thiết kế Web) và làm việc tại Viện thẩm mỹ Jenna Thanh.', keywords: ['kinh nghiem', 'cong ty', 'azseo', 'freelancer'], sort_order: 5, is_active: true },
  { category: 'Kinh nghiệm', question: 'Chương có biết làm việc chung với team Marketing không?', answer: 'Rất rành là đằng khác ạ! Sếp em từng tự tay chạy quảng cáo Google & Facebook và lên kế hoạch từ khóa, nên sếp phối hợp với team Marketing/Content cực kỳ ăn ý để cho ra các thiết kế bám sát mục tiêu chiến dịch.', keywords: ['marketing', 'content', 'quang cao'], sort_order: 6, is_active: true },
  { category: 'Mục tiêu', question: 'Định hướng công việc của Chương là gì?', answer: 'Mục tiêu của sếp em là đào sâu nghiên cứu tâm lý thị giác và hành vi người dùng, từ đó dẫn dắt các dự án sáng tạo định vị thương hiệu toàn diện, mang lại trải nghiệm số hoàn hảo nhất.', keywords: ['dinh huong', 'muc tieu', 'ke hoach'], sort_order: 7, is_active: true },
  { category: 'Sở thích', question: 'Ngoài giờ làm, Chương thích làm gì?', answer: 'Sếp em thích viết lách, nghe nhạc, xem phim, du lịch. Và đam mê lớn nhất vẫn là đọc các tài liệu về tâm lý học ứng dụng vào thiết kế.', keywords: ['so thich', 'cuoc song'], sort_order: 8, is_active: true },
  { category: 'Liên hệ', question: 'Làm sao để liên lạc trực tiếp trao đổi dự án với Chương?', answer: 'Anh/ Chị gọi ngay hoặc add Zalo sếp em qua số 038 429 7019 nhé. Hoặc gửi yêu cầu chi tiết qua email chuong.thanh1007@gmail.com. Sếp em rep cực nhanh ạ!', keywords: ['lien he', 'zalo', 'sdt', 'email', 'contact'], sort_order: 9, is_active: true },
];

export function AITab() {
  const [data, setData] = useState<AIKnowledgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [category, setCategory] = useState<string>(AI_KNOWLEDGE_CATEGORIES[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywordTags, setKeywordTags] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewStep, setPreviewStep] = useState<'idle' | 'user' | 'typing' | 'ai'>('idle');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  useEffect(() => {
    setPreviewStep('idle');
    const t1 = setTimeout(() => setPreviewStep('user'), 200);
    const t2 = setTimeout(() => setPreviewStep('typing'), 900);
    const t3 = setTimeout(() => setPreviewStep('ai'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [previewKey]);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setDbError(null);
    const { data: records, error } = await supabase
      .from("ai_knowledge")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('not find the table')) {
        setDbError("TABLE_NOT_FOUND");
      } else {
        setDbError(error.message);
      }
    } else if (records) {
      setData(records as AIKnowledgeRecord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const resetForm = () => {
    setEditingId(null);
    setCategory(AI_KNOWLEDGE_CATEGORIES[0]);
    setQuestion("");
    setAnswer("");
    setKeywordTags([]);
    setKeywordInput("");
  };

  const handleEdit = (item: AIKnowledgeRecord) => {
    setEditingId(item.id);
    setCategory(item.category);
    setQuestion(item.question);
    setAnswer(item.answer);
    setKeywordTags(item.keywords || []);
    setKeywordInput("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      alert("Vui lòng điền đủ câu hỏi và câu trả lời!");
      return;
    }

    let finalTags = [...keywordTags];
    if (keywordInput.trim()) {
      finalTags.push(keywordInput.trim().toLowerCase());
    }
    const uniqueKeywords = Array.from(new Set(finalTags));
    setKeywordInput(""); // Clear it so it doesn't linger if save is successful

    const payload = {
      category,
      question: question.trim(),
      answer: answer.trim(),
      keywords: uniqueKeywords,
    };

    if (editingId) {
      const { data: result, error } = await supabase
        .from("ai_knowledge")
        .update(payload)
        .eq("id", editingId)
        .select();

      if (error || !result || result.length === 0) {
        alert("Lỗi cập nhật hoặc phiên đăng nhập hết hạn (0 rows updated).");
      } else {
        setSuccessMsg("Đã cập nhật!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchData();
        resetForm();
      }
    } else {
      const { data: result, error } = await supabase
        .from("ai_knowledge")
        .insert([{ ...payload, is_active: true, sort_order: 0 }])
        .select();

      if (error || !result || result.length === 0) {
        alert("Lỗi thêm mới hoặc phiên đăng nhập hết hạn.");
      } else {
        setSuccessMsg("Đã thêm thành công!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchData();
        resetForm();
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { data: result, error } = await supabase
      .from("ai_knowledge")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .select();

    if (error || !result || result.length === 0) {
      alert("Lỗi thay đổi trạng thái (0 rows updated).");
    } else {
      fetchData();
    }
  };


  const handleSeedData = async () => {
    if (!window.confirm("Thao tác này sẽ tải bộ câu hỏi có sẵn vào hệ thống. Bạn có đồng ý?")) return;
    setLoading(true);
    const { data: result, error } = await supabase.from("ai_knowledge").insert(DEFAULT_KNOWLEDGE).select();
    if (error) {
      alert("Lỗi khi thêm dữ liệu: " + error.message);
      setLoading(false);
    } else {
      alert("Đã tải dữ liệu mẫu thành công!");
      fetchData();
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { data: result, error } = await supabase
      .from("ai_knowledge")
      .delete()
      .eq("id", deleteId)
      .select();

    if (error || !result || result.length === 0) {
      alert("Lỗi xóa hoặc phiên đăng nhập hết hạn (0 rows updated).");
    } else {
      fetchData();
    }
    setDeleteId(null);
  };

  const filteredData = data.filter((item) => {
    const matchSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "All" || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-6 relative">
      {/* Top Right Toast positioned opposite to "Quản lý AI Chatbot" */}
      <AnimatePresence>
        {successMsg && (
          <m.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-8 z-[9999] text-sm text-emerald-400 bg-emerald-400/10 px-5 py-3 rounded-lg flex items-center gap-2 font-medium border border-emerald-400/20 shadow-2xl backdrop-blur-md"
          >
            <Check size={16} />
            {successMsg}
          </m.div>
        )}
      </AnimatePresence>

      {/* Form Area */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editingId ? "Sửa Q&A" : "Thêm Q&A Mới"}</h2>
          {data.length === 0 && !dbError && (
            <button onClick={handleSeedData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
              <Plus size={16} /> Khôi phục bộ câu hỏi mẫu
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột 1: Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Nhóm (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 pr-10 text-zinc-100 bg-[position:right_20px_center]"
              >
                {AI_KNOWLEDGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Câu hỏi (Question)</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-100"
                placeholder="Ví dụ: Chương là ai?"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Câu trả lời (Answer)</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-100"
                placeholder="Chào bạn, mình là Trợ lý AI..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Từ khóa khớp (Keywords)</label>
              <div
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex flex-wrap gap-2 items-center focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all cursor-text min-h-[46px]"
                onClick={() => document.getElementById('keyword-tag-input')?.focus()}
              >
                {keywordTags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-md border border-emerald-500/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setKeywordTags(keywordTags.filter((_, i) => i !== index));
                      }}
                      className="text-emerald-400/70 hover:text-red-400 focus:outline-none transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  id="keyword-tag-input"
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const newTag = keywordInput.trim().toLowerCase();
                      if (newTag && !keywordTags.includes(newTag)) {
                        setKeywordTags([...keywordTags, newTag]);
                      }
                      setKeywordInput("");
                    } else if (e.key === 'Backspace' && !keywordInput && keywordTags.length > 0) {
                      setKeywordTags(keywordTags.slice(0, -1));
                    }
                  }}
                  className="flex-grow bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 min-w-[150px] p-0.5 text-sm"
                  placeholder={keywordTags.length === 0 ? "VD: xin chao, bao gia, ban la ai..." : "Nhập từ khóa..."}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-2 italic flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 bg-zinc-800 border border-zinc-700 rounded text-center leading-4 text-[10px] shadow-sm">↵</span>
                Gõ từ khoá rồi bấm <b>Enter</b> hoặc <b>Dấu phẩy (,)</b> để thêm Tag. Bấm <b>Backspace</b> để xoá.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2 items-center">
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Huỷ
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {editingId ? <Check size={18} /> : <Plus size={18} />}
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>

          {/* Cột 2: Preview */}
          <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-5 flex flex-col items-center shadow-inner relative">
            
            {/* Header & Controls */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-semibold text-zinc-400">Preview Khung Chat</h3>
              <div className="flex items-center gap-3">
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                  <button 
                    onClick={() => setPreviewMode('desktop')} 
                    className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'}`}
                    title="Desktop"
                  >
                    <Monitor size={14} />
                  </button>
                  <button 
                    onClick={() => setPreviewMode('tablet')} 
                    className={`p-1.5 rounded-md transition-colors ${previewMode === 'tablet' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'}`}
                    title="Tablet"
                  >
                    <Tablet size={14} />
                  </button>
                  <button 
                    onClick={() => setPreviewMode('mobile')} 
                    className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'}`}
                    title="Mobile"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
                <button onClick={() => setPreviewKey(k => k + 1)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                  <Play size={12} fill="currentColor" /> Play
                </button>
              </div>
            </div>
            
            {/* The Chatbox Frame */}
            <div className="flex-1 w-full flex items-center justify-center bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 overflow-hidden">
              <div 
                className={`bg-zinc-950 border border-zinc-800 shadow-2xl rounded-2xl flex flex-col relative transition-all duration-300 ${
                  previewMode === 'desktop' ? 'w-[380px] h-[400px]' : 
                  previewMode === 'tablet' ? 'w-[340px] h-[380px]' : 
                  'w-[300px] h-[360px]'
                }`}
                key={previewKey}
              >
                {/* Fake Chat Header */}
                <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3 shrink-0 rounded-t-2xl">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm relative">
                    <BotMessageSquare size={14} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">Trợ lý ảo</h3>
                    <p className="text-xs text-zinc-400 opacity-80 mt-0.5">Đang hoạt động</p>
                  </div>
                </div>

                {/* Fake Chat Body — dùng LazyMotion + AnimatePresence giống ChatPanel thật */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-950 custom-scrollbar rounded-b-2xl">
                    <AnimatePresence initial={false}>
                      
                      {/* User Bubble */}
                      {(previewStep === 'user' || previewStep === 'typing' || previewStep === 'ai') && (
                        <m.div
                          key="preview-user"
                          layout
                          initial={{ opacity: 0, scale: 0.8, x: 15, y: -15, originX: 1, originY: 0 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed break-words bg-blue-600 text-white rounded-2xl rounded-br-sm">
                            {question || "Ví dụ: Chương là ai?"}
                          </div>
                        </m.div>
                      )}

                      {/* AI Bubble (Morphs from Typing to Reply) */}
                      {(previewStep === 'typing' || previewStep === 'ai') && (
                        <m.div
                          key="preview-ai"
                          layout
                          initial={{ opacity: 0, scale: 0.8, x: -15, y: -15, originX: 0, originY: 0 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="flex justify-start"
                        >
                          <div className="max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed break-words bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-2xl rounded-bl-sm">
                            {previewStep === 'typing' ? (
                              <div className="flex gap-1 items-center h-5 px-1">
                                <m.div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                <m.div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                <m.div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                              </div>
                            ) : (
                              <>{answer || "Chào anh/chị, em là AI của Trần Thanh Chương..."}</>
                            )}
                          </div>
                        </m.div>
                      )}

                    </AnimatePresence>
                  </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 pr-10 text-sm text-zinc-100 w-full sm:w-auto bg-[position:right_20px_center]"
            >
              <option value="All">Tất cả nhóm</option>
              {AI_KNOWLEDGE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm câu hỏi..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-sm text-zinc-400">
                <th className="p-4 font-medium w-16">Trạng thái</th>
                <th className="p-4 font-medium">Nhóm</th>
                <th className="p-4 font-medium">Câu hỏi & Đáp án</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Đang tải dữ liệu...</td></tr>
              ) : dbError === "TABLE_NOT_FOUND" ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-200">Database Chưa Được Cài Đặt</h3>
                      <p className="text-zinc-400 max-w-md mx-auto text-sm">
                        Bảng <code>ai_knowledge</code> chưa tồn tại trong Supabase của bạn. 
                        Vui lòng mở <strong>SQL Editor</strong> trên Supabase và copy/paste toàn bộ nội dung trong file <code className="text-blue-400">supabase/ai_knowledge.sql</code> để chạy tạo bảng nhé.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : dbError ? (
                <tr><td colSpan={4} className="p-8 text-center text-red-400">Lỗi: {dbError}</td></tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p className="text-zinc-400">Chưa có dữ liệu Q&A nào trong hệ thống.</p>
                      <button onClick={handleSeedData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
                        <Plus size={16} /> Bấm vào đây để khôi phục bộ câu hỏi mẫu
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${item.is_active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-medium text-zinc-200 mb-1 truncate">{item.question}</div>
                      <div className="text-sm text-zinc-500 line-clamp-2">{item.answer}</div>
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="text-xs text-zinc-600 mt-1.5 italic line-clamp-1 flex items-center gap-1.5">
                          <Tag size={12} className="shrink-0" />
                          <span>{item.keywords.join(", ")}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Xác nhận xóa</h3>
                <p className="text-sm text-zinc-400">
                  Bạn có chắc chắn muốn xóa Q&A này không? Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex border-t border-zinc-800">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <div className="w-px bg-zinc-800"></div>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Đồng ý xóa
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
    </LazyMotion>
  );
}
