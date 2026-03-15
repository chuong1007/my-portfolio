"use client";

import { PageRenderer } from "@/components/builder/PageRenderer";
import { useParams } from "next/navigation";

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PageRenderer pageSelector={slug} />
      </div>
    </main>
  );
}
