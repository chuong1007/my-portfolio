"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { SectionEditor } from "../SectionEditor";
import { TextBlock, ImageBlock, ProjectBlock, BlogBlock } from "./Blocks";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

type ColumnData = {
  id: string;
  span: number;
  type: 'text' | 'image' | 'projects' | 'blogs';
  data: any;
};

type RowData = {
  id: string;
  columns: ColumnData[];
};

type UXBuilderData = {
  rows: RowData[];
};

export function UXBuilder({ sectionId }: { sectionId: string }) {
  const [layout, setLayout] = useState<UXBuilderData>({ rows: [] });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();

  const fetchLayout = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", sectionId)
      .single();

    if (data?.data) {
      setLayout(data.data as UXBuilderData);
    } else {
      // Default initial layout
      setLayout({
        rows: [
          {
            id: 'row-initial',
            columns: [
              { id: 'col-1', span: 12, type: 'text' as const, data: { title: 'Chào mừng tới HOME 2', content: 'Đây là trang web được xây dựng bằng UX Builder.' } }
            ]
          }
        ]
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLayout();
  }, [sectionId]);

  const saveLayout = async (newLayout: UXBuilderData) => {
    const supabase = createClient();
    await supabase
      .from("site_content")
      .upsert({ id: sectionId, data: newLayout, updated_at: new Date().toISOString() });
    setLayout(newLayout);
  };

  if (loading) return null;

  const renderBlock = (col: ColumnData) => {
    switch (col.type) {
      case 'text': return <TextBlock data={col.data} />;
      case 'image': return <ImageBlock data={col.data} />;
      case 'projects': return <ProjectBlock data={col.data} />;
      case 'blogs': return <BlogBlock data={col.data} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-20 pb-32">
      {layout.rows.map((row, rowIndex) => (
        <div key={row.id} className="relative group/row px-6 md:px-12">
          {isAdmin && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl z-50">
              <button
                onClick={() => {
                  const newRows = [...layout.rows];
                  newRows.splice(rowIndex, 0, { id: `row-${Date.now()}`, columns: [{ id: `col-${Date.now()}`, span: 12, type: 'text' as const, data: { title: 'New Row' } }] });
                  saveLayout({ rows: newRows });
                }}
                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg" title="Thêm hàng trên"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-1" />
              <button
                onClick={() => {
                  const newRows = layout.rows.filter(r => r.id !== row.id);
                  saveLayout({ rows: newRows });
                }}
                className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg" title="Xóa hàng"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-12 gap-8 md:gap-12">
            {row.columns.map((col, colIndex) => (
              <div
                key={col.id}
                className={cn(
                  "relative group/col",
                  col.span === 12 && "col-span-12",
                  col.span === 10 && "col-span-12 md:col-span-10",
                  col.span === 9 && "col-span-12 md:col-span-9",
                  col.span === 8 && "col-span-12 md:col-span-8",
                  col.span === 6 && "col-span-12 md:col-span-6",
                  col.span === 4 && "col-span-12 md:col-span-4",
                  col.span === 3 && "col-span-12 md:col-span-3",
                )}
              >
                <SectionEditor
                  sectionId={`${sectionId}-${row.id}-${col.id}`}
                  initialData={col}
                  onSave={fetchLayout}
                  extraActions={isAdmin && (
                    <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800 mr-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newRows = [...layout.rows];
                          const currentCol = newRows[rowIndex].columns[colIndex];
                          if (currentCol.span > 2) currentCol.span -= 1;
                          saveLayout({ rows: newRows });
                        }}
                        className="p-1 hover:bg-zinc-800 rounded-full"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-bold w-4 text-center">{col.span}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newRows = [...layout.rows];
                          const currentCol = newRows[rowIndex].columns[colIndex];
                          if (currentCol.span < 12) currentCol.span += 1;
                          saveLayout({ rows: newRows });
                        }}
                        className="p-1 hover:bg-zinc-800 rounded-full"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                >
                  {renderBlock(col)}
                </SectionEditor>

                {isAdmin && (
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover/col:opacity-100 transition-all pointer-events-none">
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg pointer-events-auto">
                      <button
                        onClick={() => {
                          const newRows = [...layout.rows];
                          newRows[rowIndex].columns.push({ id: `col-${Date.now()}`, span: 12 - col.span > 0 ? 12 - col.span : 6, type: 'text' as const, data: { title: 'New Column' } });
                          saveLayout({ rows: newRows });
                        }}
                        className="p-1 px-2 text-[10px] uppercase font-bold hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                      >
                        Thêm cột
                      </button>
                      {row.columns.length > 1 && (
                        <button
                          onClick={() => {
                            const newRows = [...layout.rows];
                            newRows[rowIndex].columns = newRows[rowIndex].columns.filter(c => c.id !== col.id);
                            saveLayout({ rows: newRows });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {isAdmin && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => {
              const newRows = [...layout.rows, { id: `row-${Date.now()}`, columns: [{ id: `col-${Date.now()}`, span: 12, type: 'text' as const, data: { title: 'New Row' } }] }];
              saveLayout({ rows: newRows });
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-6 py-3 rounded-2xl transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm hàng mới
          </button>
        </div>
      )}
    </div>
  );
}
