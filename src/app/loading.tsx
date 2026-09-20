"use client";
import { useEffect, useState } from "react";

export default function Loading({ isCompleting = false }: { isCompleting?: boolean }) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isCompleting]);

  if (!show && isCompleting) return null;

  return (
    <div className={`fixed inset-0 z-[100] w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] transition-opacity duration-300 ${isCompleting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="w-full max-w-[200px] overflow-hidden">
        {/* Nền xám nhạt ở dưới cùng (cố định) */}
        <div className="h-[3px] w-full bg-zinc-800 rounded-full overflow-hidden relative">
          
          {/* Thanh trắng thứ 1 */}
          <div className="comet-bar" />
          {/* Thanh trắng thứ 2 xuất hiện sớm hơn (delay 1s) để nối đuôi */}
          <div className="comet-bar" style={{ animationDelay: '0.75s' }} />
          
        </div>
      </div>
    </div>
  );
}
