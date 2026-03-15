"use client";

import { PageRenderer } from "@/components/builder/PageRenderer";
import { useParams } from "next/navigation";

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <main className="min-h-screen pt-24 w-full">
      <PageRenderer pageSelector={slug} />
    </main>
  );
}
