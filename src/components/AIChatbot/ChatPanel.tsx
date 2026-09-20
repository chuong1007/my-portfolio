"use client";

import React, { useState, useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Fuse from "fuse.js";
import { normalizeVietnamese, linkify } from "@/lib/text-utils";
import type { AIKnowledgeRecord } from "@/lib/ai-constants";
import { Send, BotMessageSquare, List, MessageCircleQuestion, ChevronDown, ChevronUp } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  isTyping?: boolean;
  isSuggestions?: boolean;
};

const FALLBACK_MESSAGE = "Em chưa có thông tin chính xác cho ý này. Anh/ Chị vui lòng chọn các gợi ý bên dưới hoặc nhấn nút 'Liên hệ trực tiếp' để trao đổi với Chương nhé!";

const DEFAULT_KNOWLEDGE = [
  { id: '1', category: 'Giới thiệu', question: 'Giới thiệu một chút về Chương được không?', answer: 'Chào anh/chị, em là AI của Trần Thanh Chương. Sếp em là một Senior Graphic / Web UI & Packaging Designer với hơn 7 năm kinh nghiệm thực chiến. Sếp chuyên trị việc xây dựng hình ảnh thương hiệu đa nền tảng, từ ấn phẩm truyền thông, bao bì sản phẩm cho đến giao diện Website.', keywords: ['chuong la ai', 'gioi thieu', 'ban la ai'], sort_order: 1, is_active: true },
  { id: '2', category: 'Giới thiệu', question: 'Điểm khác biệt lớn nhất của Chương so với các Designer khác là gì?', answer: 'Điểm ăn tiền nhất của sếp em là sự kết hợp giữa Thẩm mỹ hiện đại và Tư duy chiến lược. Sếp không chỉ vẽ cho đẹp mà còn cực kỳ am hiểu tâm lý thị giác người dùng, giúp tối ưu tỷ lệ chuyển đổi cho sản phẩm.', keywords: ['the manh', 'diem khac biet', 'khac biet'], sort_order: 2, is_active: true },
  { id: '3', category: 'Kỹ năng', question: 'Chương thường sử dụng những phần mềm nào?', answer: 'Về đồ hoạ, sếp em dùng thành thạo Photoshop và Illustrator. Về UI/UX thì sếp làm chủ Figma để bàn giao file mượt mà cho Lập trình viên. Về dựng video, sếp dùng Adobe Premiere và Capcut.', keywords: ['phan mem', 'tool', 'figma', 'photoshop', 'ky nang'], sort_order: 3, is_active: true },
  { id: '4', category: 'Kỹ năng', question: 'Chương có bắt kịp công nghệ AI không?', answer: 'Chắc chắn rồi ạ! Sếp em luôn cập nhật xu hướng và đang ứng dụng rất hiệu quả các công cụ AI thế hệ mới vào quy trình thiết kế đồ hoạ và tạo video để đẩy nhanh tốc độ mà vẫn giữ chất lượng cao.', keywords: ['ai', 'cong nghe ai', 'ai tool'], sort_order: 4, is_active: true },
  { id: '5', category: 'Kinh nghiệm', question: 'Kinh nghiệm làm việc thực tế của Chương thế nào?', answer: 'Sếp em có 7 năm chinh chiến. Từ 2/2020 đến nay sếp đang làm Freelancer mảng Web UI, Bao bì & Nhận diện thương hiệu. Trước đó, sếp từng làm Leader Team Graphic tại AZSEO (quản lý team thiết kế Web) và làm việc tại Viện thẩm mỹ Jenna Thanh.', keywords: ['kinh nghiem', 'cong ty', 'azseo', 'freelancer'], sort_order: 5, is_active: true },
  { id: '6', category: 'Kinh nghiệm', question: 'Chương có biết làm việc chung với team Marketing không?', answer: 'Rất rành là đằng khác ạ! Sếp em từng tự tay chạy quảng cáo Google & Facebook và lên kế hoạch từ khóa, nên sếp phối hợp với team Marketing/Content cực kỳ ăn ý để cho ra các thiết kế bám sát mục tiêu chiến dịch.', keywords: ['marketing', 'content', 'quang cao'], sort_order: 6, is_active: true },
  { id: '7', category: 'Mục tiêu', question: 'Định hướng công việc của Chương là gì?', answer: 'Mục tiêu của sếp em là đào sâu nghiên cứu tâm lý thị giác và hành vi người dùng, từ đó dẫn dắt các dự án sáng tạo định vị thương hiệu toàn diện, mang lại trải nghiệm số hoàn hảo nhất.', keywords: ['dinh huong', 'muc tieu', 'ke hoach'], sort_order: 7, is_active: true },
  { id: '8', category: 'Sở thích', question: 'Ngoài giờ làm, Chương thích làm gì?', answer: 'Sếp em thích viết lách, nghe nhạc, xem phim, du lịch. Và đam mê lớn nhất vẫn là đọc các tài liệu về tâm lý học ứng dụng vào thiết kế.', keywords: ['so thich', 'cuoc song'], sort_order: 8, is_active: true },
  { id: '9', category: 'Liên hệ', question: 'Làm sao để liên lạc trực tiếp trao đổi dự án với Chương?', answer: 'Anh/ Chị gọi ngay hoặc add Zalo sếp em qua số 038 429 7019 nhé. Hoặc gửi yêu cầu chi tiết qua email chuong.thanh1007@gmail.com. Sếp em rep cực nhanh ạ!', keywords: ['lien he', 'zalo', 'sdt', 'email', 'contact'], sort_order: 9, is_active: true },
];

export default function ChatPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", sender: "ai", text: "Chào anh/chị! Em là Trợ lý AI của Trần Thanh Chương. Em có thể giúp gì cho anh/chị hôm nay?" },
    { id: "sugg_init", sender: "ai", text: "", isSuggestions: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [isDBReady, setIsDBReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Esc key to close, auto-focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch DB once per session
  useEffect(() => {
    const fetchDB = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("ai_knowledge")
          .select("*").eq("is_active", true).order("sort_order", { ascending: true });
        
        if (!error && data && data.length > 0) {
          setKnowledgeBase(data);
        } else {
          setKnowledgeBase(DEFAULT_KNOWLEDGE); // Fallback if table doesn't exist yet
        }
      } catch (err) {
        console.error("Chatbot fetch error:", err);
      } finally {
        setIsDBReady(true);
      }
    };
    fetchDB();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleAsk = (query: string) => {
    if (!query.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const userMsgId = Date.now().toString() + Math.random().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: "user", text: query.trim() }]);
    setInputValue("");

    // Find Answer using Fuse
    let answerText = FALLBACK_MESSAGE;
    
    if (knowledgeBase.length > 0) {
      const exactMatch = knowledgeBase.find(qa => qa.question.toLowerCase() === query.trim().toLowerCase());
      if (exactMatch) {
        answerText = exactMatch.answer;
      } else {
        const fuse = new Fuse(knowledgeBase, {
        keys: [
          { name: 'keywords', weight: 0.7 },
          { name: 'question', weight: 0.3 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        getFn: (obj, path) => {
          // Fix: Avoid Fuse.config.getFn wrapping arrays into objects
          const key = Array.isArray(path) ? path[0] : path;
          const value = (obj as any)[key];
          if (Array.isArray(value)) {
            return value.map(v => normalizeVietnamese(String(v)));
          }
          return normalizeVietnamese(String(value || ''));
        }
      });

      const normalizedQuery = normalizeVietnamese(query);
      const results = fuse.search(normalizedQuery);
      
      if (results.length > 0) {
        answerText = results[0].item.answer;
        }
      }
    }

    const typingMsgId = (Date.now() + 1).toString() + Math.random().toString();
    // Simulate typing delay based on answer length (max 1.5s)
    const delay = Math.min(Math.max(answerText.length * 10, 600), 1500);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: typingMsgId, sender: "ai", text: "", isTyping: true }]);
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => msg.id === typingMsgId ? { ...msg, text: answerText, isTyping: false } : msg)
        );
        if (answerText === FALLBACK_MESSAGE) {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: "ai", text: "", isSuggestions: true }]);
        }
        isProcessingRef.current = false;
      }, delay);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk(inputValue);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.95, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-[108px] right-4 md:right-6 w-[calc(100vw-32px)] md:w-[380px] h-[75vh] max-h-[600px] flex flex-col bg-[var(--bg-base)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-[999] overflow-hidden sm:pb-0"
            role="dialog"
            aria-label="Cửa sổ AI Chatbot"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                  <BotMessageSquare size={18} />
                </div>
                {isDBReady && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--bg-surface)] rounded-full"></span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Trợ lý ảo</h3>
                <p className="text-xs text-[var(--text-muted)] opacity-80 mt-0.5">
                  {isDBReady ? "Đang hoạt động" : "Đang kết nối..."}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 scrollbar-hide" aria-live="polite">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <m.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: msg.sender === "user" ? 15 : -15, y: -15, originX: msg.sender === "user" ? 1 : 0, originY: 0 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed break-words ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.isTyping ? (
                        <div className="flex gap-1 items-center h-5 px-1">
                          <m.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                          <m.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                          <m.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                        </div>
                      ) : msg.isSuggestions ? (
                        <div className="flex flex-col gap-2 w-full">
                          <span className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm"><MessageCircleQuestion size={13} strokeWidth={2.5} /></div> Câu hỏi thường gặp:</span>
                          <div className="flex flex-col gap-2">
                            {(showAllSuggestions ? knowledgeBase : knowledgeBase.slice(0, 3)).map((qa) => (
                              <button
                                key={qa.id}
                                onClick={() => handleAsk(qa.question)}
                                className="text-left px-3.5 py-2.5 bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-primary)] hover:text-blue-500 text-xs md:text-sm rounded-xl transition-all duration-200 shadow-sm"
                              >
                                {qa.question}
                              </button>
                            ))}
                            {knowledgeBase.length > 3 && (
                              <button
                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                className="flex items-center justify-center gap-1 w-full text-center px-3.5 py-2 text-blue-500 hover:text-blue-600 text-xs md:text-sm font-semibold transition-colors mt-1"
                              >
                                {showAllSuggestions ? (
                                  <>Thu gọn bớt <ChevronUp size={16} className="mt-[1px]" /></>
                                ) : (
                                  <>Xem thêm {knowledgeBase.length - 3} câu hỏi khác <ChevronDown size={16} className="mt-[1px]" /></>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        linkify(msg.text)
                      )}
                      
                      {/* Fallback Contact Button */}
                      {msg.text === FALLBACK_MESSAGE && !msg.isTyping && (
                        <div className="mt-3">
                          <a href="#contact" onClick={onClose} className="inline-block px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-semibold rounded-full hover:opacity-90 transition-opacity">
                            Liên hệ trực tiếp
                          </a>
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>



            {/* Input Area */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  title="Hiện danh sách câu hỏi"
                  onClick={() => setMessages(prev => [...prev, { id: Date.now().toString(), sender: "ai", text: "", isSuggestions: true }])}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-blue-500 rounded-full border border-[var(--border-subtle)] transition-colors"
                >
                  <List size={18} />
                </button>
                <div className="flex-1 relative flex items-center">
                  <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi AI bất kỳ điều gì..."
                  className="w-full bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] rounded-full pl-4 pr-10 py-3 outline-none border border-[var(--border-subtle)] focus:border-[var(--border-default)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAsk(inputValue)}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
