"use client";

import { PageRenderer } from "@/components/builder/PageRenderer";

export default function Home() {
  return (
    <main className="min-h-screen pt-24 w-full">
      <PageRenderer pageSelector="home" />
    </main>
  );
}
