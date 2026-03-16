"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  // Hook useSearchParams must be inside Suspense during static generation
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-zinc-800 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-6 uppercase tracking-wider">
        Trang không tồn tại
      </h2>
      <p className="text-zinc-500 max-w-md mb-10 leading-relaxed">
        Có vẻ như đường dẫn {from ? `<${from}>` : ""} bạn đang truy cập không tồn tại hoặc đã bị chuyển dời.
      </p>
      
      <Link 
        href="/"
        className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-2xl transition-all duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
          Quay lại trang chủ
        </span>
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}
