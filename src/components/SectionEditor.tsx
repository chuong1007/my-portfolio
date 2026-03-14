"use client";

import { motion } from "framer-motion";
import { Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminModal } from "./AdminModal";
import { createClient } from "@/lib/supabase";

type SectionEditorProps = {
  sectionId: string;
  children: React.ReactNode;
  initialData: any;
  onSave: () => void;
  isVisible?: boolean;
  extraActions?: React.ReactNode;
};

export function SectionEditor({ sectionId, children, initialData, onSave, isVisible = true, extraActions }: SectionEditorProps) {
  const { isAdmin, isEditMode } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const nextValue = !isVisible;
      
      // Merge with initialData to preserve other fields
      const newData = { ...initialData, isVisible: nextValue };

      const { error } = await supabase
        .from('site_content')
        .upsert({ 
          id: sectionId, 
          data: newData, 
          updated_at: new Date().toISOString() 
        });

      if (!error) {
        onSave(); // Trigger parent re-fetch
      } else {
        console.error("Toggle visibility error:", error);
      }
    } catch (err) {
      console.error("Toggle visibility error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAdmin || !isEditMode) return <>{children}</>;

  return (
    <div className={cn(
      "relative group/section transition-all duration-300",
      !isVisible && "opacity-40 grayscale-[0.5] hover:opacity-60"
    )}>
      {/* Hidden Indicator */}
      {!isVisible && (
        <div className="absolute top-4 left-4 z-50 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Hidden Section</span>
        </div>
      )}

      {/* Admin Controls Overlay */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-0 group-hover/section:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/section:translate-y-0">
        {/* Extra Actions Integration */}
        {extraActions && (
          <div className="flex items-center gap-2 mr-1">
            {extraActions}
          </div>
        )}

        {/* Visibility Toggle Button */}
        <button
          onClick={handleToggleVisibility}
          disabled={isUpdating}
          className={cn(
            "p-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-xl",
            isVisible 
              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20" 
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700"
          )}
          title={isVisible ? "Ẩn Section" : "Hiện Section"}
        >
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />)}
        </button>

        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black p-3 rounded-full border border-white/20 hover:bg-zinc-200 transition-all duration-300 shadow-xl"
          title="Chỉnh sửa nội dung"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      {children}

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionId={sectionId}
        initialData={initialData}
        onSave={onSave}
      />
    </div>
  );
}
