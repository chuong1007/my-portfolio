"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TagPageHeader({ tagName, resultsCount }: { tagName: string, resultsCount: number }) {
  const router = useRouter();

  return (
    <div className="mb-16">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors mb-10 group w-fit"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      <header className="space-y-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-white/20 text-white font-bold text-xl md:text-3xl shrink-0">
            #
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight italic py-2 leading-[1.1]">
            <span className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent inline-block pr-6">
              {tagName}
            </span>
          </h1>
        </div>
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl font-medium mt-4">
          {resultsCount > 0 
            ? `Hiện có ${resultsCount} dự án thuộc chủ đề này.` 
            : "Chưa có dự án nào thuộc chủ đề này."}
        </p>
      </header>
    </div>
  );
}
