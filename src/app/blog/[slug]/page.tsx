import { BlogDetail } from "@/components/BlogDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetail slug={slug} />;
}
