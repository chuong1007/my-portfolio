"use client";

import { LoginModal } from "@/components/admin/LoginModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/admin");
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <LoginModal isOpen={isOpen} onClose={() => router.push("/")} />
    </div>
  );
}
