"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { BotMessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

// Lazy load the actual panel with SSR disabled
const ChatPanel = dynamic(() => import("./ChatPanel"), {
  ssr: false,
});

export default function ChatbotGate() {
  const pathname = usePathname();
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
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowGate(true); // Show immediately if user scrolls
      }
    };
    
    window.addEventListener("introFinished", onIntroFinished);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial scroll position (in case of page refresh while scrolled)
    if (window.scrollY > 20) {
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
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Hide entirely on admin routes or if disabled in settings
  if (pathname.startsWith("/admin") || !isChatbotActive) {
    return null;
  }

  const handleToggle = () => {
    if (!hasOpened) setHasOpened(true);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-label={isOpen ? "Đóng Chatbot" : "Mở Chatbot"}
        className={cn(
          "fixed bottom-10 right-6 w-14 h-14 bg-blue-600 text-white flex items-center justify-center shadow-lg transition-all z-[1000] outline-none focus:outline-none focus-visible:outline-none focus:ring-0",
          showGate 
            ? "scale-100 opacity-100 duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.1)]" 
            : "scale-0 opacity-0 duration-300 pointer-events-none",
          showGate && !isOpen && "hover:scale-110",
          isOpen && "hover:scale-95"
        )}
        style={{ borderRadius: isOpen ? '50%' : '28px 28px 5px 28px', paddingBottom: 'env(safe-area-inset-bottom)' }}
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
