"use client";

import { useAdmin } from '@/context/AdminContext';
import { Edit2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function AdminEditButton({ slug }: { slug?: string }) {
  const { isAdmin, isEditMode } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAdmin || !isEditMode) return null;

  // Resolve slug dynamically if not provided
  let targetSlug = slug;
  let isBlogMode = false;

  if (!targetSlug && pathname) {
    if (pathname === '/') {
      targetSlug = 'home';
    } else if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
      // It's a single blog post. The editor for blogs is usually modal-based in /admin/blogs,
      // but if the user wants an edit button, we can redirect them to the blog manager
      // or implement a feature to open the blog modal. Here we redirect to blog admin.
      targetSlug = pathname.replace('/blog/', '');
      isBlogMode = true;
    } else {
      // E.g., /about -> about, /projects -> projects
      targetSlug = pathname.replace(/^\//, '');
    }
  }

  // Hide the button if we are inside the admin panel, the builder itself, or on the home page
  if (pathname?.startsWith('/admin') || pathname === '/home-2' || pathname === '/') return null;

  const handleClick = () => {
    if (isBlogMode) {
      // Redirect to blog admin with edit slug query (if we had such a feature)
      // For now, redirect to blog list
      router.push('/admin/blogs');
    } else {
      router.push(`/home-2?page=${targetSlug || 'home'}&builder=true`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-white/10 transition-all font-bold text-sm bg-transparent text-white border border-white hover:text-blue-400 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 group"
    >
      <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
      {isBlogMode ? "QUẢN LÝ BLOG" : "MỞ TRÌNH CHỈNH SỬA"}
    </button>
  );
}
