import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TagProjectGrid from "@/components/TagProjectGrid";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ tag: string }>;
};

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Fetch projects with this tag
  // Postgres @> or cs doesn't work well with Supabase JS sometimes for JSONB arrays unless using proper filters
  // If it's as a JSONB array, .contains('tags', [tag]) is the standard Supabase way
  const { data: projects, error } = await supabase
    .from('projects')
    .select("id, title, slug, cover_image, tags, is_featured, is_visible")
    .contains('tags', [decodedTag])
    .eq('is_visible', true)
    .order('is_featured', { ascending: false })
    .order('featured_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tag projects:", error);
  }

  // If no projects found, show empty state (no notFound to let user go back)
  const resultsCount = projects?.length || 0;

  return (
    <main className="min-h-screen pt-32 pb-24 dark bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Navigation */}
        <div className="mb-16">
          <Link
            href="/#dự-án"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors mb-10 group w-fit"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Trở về trang chủ</span>
          </Link>

          <header className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight">
              Phân loại: <span className="bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">{decodedTag}</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl font-medium">
              {resultsCount > 0 
                ? `Hiện có ${resultsCount} dự án thuộc chủ đề này.` 
                : "Chưa có dự án nào thuộc chủ đề này."}
            </p>
          </header>
        </div>

        {/* Content */}
        {resultsCount > 0 ? (
          <TagProjectGrid projects={projects || []} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
            <h3 className="text-zinc-400 text-xl font-medium">Không tìm thấy dự án</h3>
            <p className="text-zinc-600 mt-2 text-sm">Vui lòng quay lại trang chủ hoặc chọn tag khác.</p>
            <Link 
              href="/#dự-án"
              className="mt-8 px-6 py-2.5 bg-zinc-50 text-zinc-950 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Quay lại trang chủ
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
