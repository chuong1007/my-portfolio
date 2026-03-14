"use client";

import { useAdmin } from '@/context/AdminContext';
import { Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminEditButton({ slug }: { slug: string }) {
  const { isAdmin, isEditMode } = useAdmin();
  const router = useRouter();

  if (!isAdmin || !isEditMode) return null;

  return (
    <button
      onClick={() => router.push(`/home-2?page=${slug}&builder=true`)}
      className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-white/10 transition-all font-bold text-sm bg-transparent text-white border border-white hover:text-blue-400 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 group"
    >
      <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
      MỞ TRÌNH CHỈNH SỬA
    </button>
  );
}
