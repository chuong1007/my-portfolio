"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { AdminEditButton } from "@/components/builder/AdminEditButton";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBuilder = pathname === "/admin/builder";

  return (
    <>
      {!isBuilder && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isBuilder && <Contact />}
      {!isBuilder && <AdminEditButton />}
    </>
  );
}
