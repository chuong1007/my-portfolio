import { createClient } from "@/lib/supabase";
import { PageRenderer } from "@/components/builder/PageRenderer";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { AdminEditButton } from "@/components/builder/AdminEditButton";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const supabase = createClient();
  const { slug } = await params;

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !page) {
    return notFound();
  }

  // Logic: Nếu False, trang bị ẩn (chỉ Admin xem được), khách vào báo 404.
  // Ghi chú: Hiện tại chúng ta check boolean đơn giản. 
  // Nếu muốn Admin vẫn xem được, cần check session ở đây.
  if (!page.is_published) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Header />
      <div className="pt-24 pb-20">
        <PageRenderer data={page.page_content} />
      </div>
      <AdminEditButton slug={slug} />
    </main>
  );
}
