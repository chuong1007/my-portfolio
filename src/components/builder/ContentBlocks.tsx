"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { RichTextEditor } from "./RichTextEditor";
import { Trash2, Image as ImageIcon, Briefcase, Type, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- PROJECT DISPLAY COMPONENT ---
export function ProjectCard({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (data) setProject(data);
      setLoading(false);
    };
    if (projectId) fetchProject();
  }, [projectId]);

  if (loading) return <div className="aspect-video bg-zinc-900 animate-pulse rounded-2xl" />;
  if (!project) return <div className="p-4 bg-red-500/10 text-red-500 text-xs rounded-xl">Không tìm thấy dự án</div>;

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={project.image_url} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold text-white uppercase tracking-tight">{project.title}</h4>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">{project.category}</p>
      </div>
    </div>
  );
}

// --- BLOCK TYPES RENDERER ---
interface BlockProps {
  rowId: string;
  colId: string;
  block: any;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  isPreviewingLocal?: boolean;
}

export function ContentBlock({ rowId, colId, block, onUpdate, onRemove, isPreviewingLocal }: BlockProps) {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (block.type === 'projects') {
      const fetchAll = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("projects").select("id, title");
        if (data) setProjects(data);
      };
      fetchAll();
    }
  }, [block.type]);

  return (
    <div className={cn(
      "group/block relative transition-all rounded-2xl",
      !isPreviewingLocal 
        ? (block.type === 'text' ? "" : "p-4 bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700") 
        : ""
    )}>
      {!isPreviewingLocal && (
        <div className="absolute -right-2 -top-2 opacity-0 group-hover/block:opacity-100 transition-all z-10">
          <button onClick={onRemove} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {block.type === 'text' && (
        <RichTextEditor 
          content={block.content || ''} 
          onChange={(html) => onUpdate({ content: html })} 
          isPreviewingLocal={isPreviewingLocal}
        />
      )}

      {block.type === 'image' && (
        <div className="space-y-4">
          {block.url ? (
            <img src={block.url} alt="Block" className={cn("w-full h-auto rounded-xl", !isPreviewingLocal && "border border-zinc-800")} />
          ) : (
            !isPreviewingLocal && (
              <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 rounded-xl text-zinc-600">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Chưa có ảnh</span>
              </div>
            )
          )}
          {!isPreviewingLocal && (
            <input 
              type="text" 
              placeholder="Dán URL ảnh..." 
              value={block.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg focus:outline-none focus:border-zinc-600"
            />
          )}
        </div>
      )}

      {block.type === 'projects' && (
        <div className="space-y-4">
          {!isPreviewingLocal && (
            <select 
              value={block.projectId || ''} 
              onChange={(e) => onUpdate({ projectId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs rounded-xl focus:outline-none focus:border-zinc-600 text-white"
            >
              <option value="">-- Chọn dự án --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
          {block.projectId && <ProjectCard projectId={block.projectId} />}
          {!block.projectId && isPreviewingLocal && (
             <div className="p-4 bg-zinc-900 text-zinc-500 text-xs rounded-xl text-center">Chưa chọn dự án</div>
          )}
        </div>
      )}
    </div>
  );
}
