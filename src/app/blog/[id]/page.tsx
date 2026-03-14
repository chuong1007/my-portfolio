import { BlogDetail } from "@/components/BlogDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BlogDetail id={id} />;
}
