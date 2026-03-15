"use client";

import { RowData, ColumnData, BlockData } from "@/store/useBuilderStore";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageRendererProps {
  pageSelector?: string; // slug of the page
  data?: RowData[];      // direct data
}

export function PageRenderer({ pageSelector, data }: PageRendererProps) {
  const [pageData, setPageData] = useState<RowData[]>(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setPageData(data);
      setLoading(false);
      return;
    }
    if (!pageSelector) return;

    async function fetchData() {
      const supabase = createClient();
      const { data: dbData, error } = await supabase
        .from('pages')
        .select('page_content')
        .eq('slug', pageSelector)
        .single();
      
      if (dbData && !error) {
        setPageData(dbData.page_content as RowData[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [pageSelector, data]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-zinc-50 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {pageData.map((row: RowData) => (
        <div 
          key={row.id} 
          className={cn(
            "grid gap-8 w-full",
            row.styles?.backgroundColor,
            row.styles?.padding,
            row.visibility?.hideOnMobile && "hidden md:grid",
            row.visibility?.hideOnDesktop && "md:hidden"
          )}
          style={{ gridTemplateColumns: `repeat(${row.columns.length}, minmax(0, 1fr))` }}
        >
          {row.columns.map((col: ColumnData) => (
            <div 
              key={col.id} 
              className={cn(
                "space-y-6",
                col.styles?.backgroundColor,
                col.styles?.padding,
                col.styles?.textAlign === 'center' ? 'text-center' : col.styles?.textAlign === 'right' ? 'text-right' : col.styles?.textAlign === 'justify' ? 'text-justify' : 'text-left',
                col.visibility?.hideOnMobile && "hidden md:block",
                col.visibility?.hideOnDesktop && "md:hidden"
              )}
            >
              {col.blocks.map((block: BlockData) => (
                <RenderBlock 
                  key={block.id} 
                  block={block} 
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RenderBlock({ block }: { block: BlockData }) {
  const wrapperClass = cn(
    "w-full",
    block.styles?.backgroundColor,
    block.styles?.padding,
    block.styles?.margin,
    block.styles?.textAlign === 'center' ? 'text-center' : block.styles?.textAlign === 'right' ? 'text-right' : block.styles?.textAlign === 'justify' ? 'text-justify' : 'text-left',
    block.visibility?.hideOnMobile && "hidden md:block",
    block.visibility?.hideOnDesktop && "md:hidden"
  );

  let content = null;

  if (block.type === 'text') {
    content = (
      <div 
        className="prose prose-invert max-w-none text-zinc-300 custom-tiptap-content ProseMirror tiptap"
        dangerouslySetInnerHTML={{ __html: block.content || "" }}
      />
    );
  } else if (block.type === 'image') {
    content = block.url ? (
      <img src={block.url} alt="Content" className="w-full h-auto rounded-xl object-cover shadow-2xl border border-zinc-900" />
    ) : null;
  } else if (block.type === 'projects') {
    content = <ProjectRenderer projectId={block.projectId} />;
  }

  return content ? <div className={wrapperClass}>{content}</div> : null;
}

function ProjectRenderer({ projectId }: { projectId?: string }) {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!projectId) return;
    async function fetchProject() {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (data) setProject(data);
    }
    fetchProject();
  }, [projectId]);

  if (!project) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300"
    >
      {project.image_url && (
        <img src={project.image_url} alt={project.title} className="w-full aspect-video object-cover" />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-zinc-50 mb-2">{project.title}</h3>
        <p className="text-zinc-400 text-sm line-clamp-2">{project.description}</p>
      </div>
    </motion.div>
  );
}
