"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { BotMessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAdmin } from "@/context/AdminContext";

// Lazy load the actual panel with SSR disabled
const ChatPanel = dynamic(() => import("./ChatPanel"), {
  ssr: false,
});

export default function ChatbotGate() {
  const pathname = usePathname();
  const { isAdmin, isEditMode } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [isChatbotActive, setIsChatbotActive] = useState(true);

  useEffect(() => {
    // 1. Initial State
    if (pathname !== "/") {
      setShowGate(true);
    } else {
      setShowGate(false); // Hide on homepage initially until intro finishes
    }

    // 2. Event Listeners
    const onIntroFinished = () => {
      setShowGate(true); // Show immediately when intro is done
    };
    
    const handleScroll = (e?: Event) => {
      let currentScroll = window.scrollY;
      if (e && e.target instanceof Element && e.target.classList.contains('custom-scrollbar')) {
        currentScroll = e.target.scrollTop;
      }
      
      if (currentScroll > 20 || window.scrollY > 20) {
        setShowGate(true); // Show immediately if user scrolls
      }
    };
    
    window.addEventListener("introFinished", onIntroFinished);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true }); // Capture to catch scroll inside elements
    
    // Check initial scroll position
    const scrollContainer = document.querySelector('.custom-scrollbar');
    if (window.scrollY > 20 || (scrollContainer && scrollContainer.scrollTop > 20)) {
      setShowGate(true);
    }
    
    // Fetch Chatbot Status
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_content').select('data').eq('id', 'global_settings').single();
        if (data && data.data && (data.data as any).isChatbotActive === false) {
          setIsChatbotActive(false);
        }
      } catch (e) {
        // Ignore errors, default to true
      }
    };
    checkStatus();

    return () => {
      window.removeEventListener("introFinished", onIntroFinished);
      window.removeEventListener("scroll", handleScroll, { capture: true } as any);
    };
  }, [pathname]);

  // Hide entirely on admin routes or if disabled in settings
  if (pathname.startsWith("/admin") || !isChatbotActive) {
    return null;
  }

  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Tần số trầm hơn, mượt hơn (450Hz khi mở, 300Hz khi đóng)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isOpen ? 300 : 450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      
      // Âm lượng siêu nhỏ (0.05) và có độ fade-in mượt (0.02s) để triệt tiêu tiếng click gắt
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Ignore audio errors silently
    }
  };

  const handleToggle = () => {
    playPopSound();
    if (!hasOpened) setHasOpened(true);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-label={isOpen ? "Đóng Chatbot" : "Mở Chatbot"}
        className={cn(
          "fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(2.5rem+env(safe-area-inset-bottom))] right-4 md:right-6 w-14 h-14 bg-blue-600 text-white flex items-center justify-center shadow-lg transition-all z-[1000] outline-none focus:outline-none focus-visible:outline-none focus:ring-0",
          showGate 
            ? "scale-100 opacity-100 duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.1)]" 
            : "scale-0 opacity-0 duration-300 pointer-events-none",
          showGate && !isOpen && "hover:scale-110",
          isOpen && "hover:scale-95"
        )}
        style={{ borderRadius: isOpen ? '50%' : '28px 28px 5px 28px' }}
      >
        {isOpen ? <X size={24} /> : <BotMessageSquare size={24} />}
      </button>

      {/* Only render panel once it has been opened at least once */}
      {hasOpened && (
        <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
