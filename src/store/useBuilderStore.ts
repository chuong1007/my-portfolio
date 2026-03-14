"use client";

import { create } from 'zustand';

export type BlockType = 'text' | 'image' | 'projects';

export interface ElementStyles {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ElementVisibility {
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

export interface BlockData {
  id: string;
  type: BlockType;
  content?: string;
  url?: string;
  projectId?: string;
  styles?: ElementStyles;
  visibility?: ElementVisibility;
}

export interface ColumnData {
  id: string;
  span: number;
  blocks: BlockData[];
  styles?: ElementStyles;
  visibility?: ElementVisibility;
}

export interface RowData {
  id: string;
  columns: ColumnData[];
  styles?: ElementStyles;
  visibility?: ElementVisibility;
}

export interface SelectedElement {
  type: 'row' | 'col' | 'block';
  rowId: string;
  colId?: string;
  blockId?: string;
}

export interface PageEntry {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  show_in_header: boolean;
  page_content?: RowData[];
}

export interface BuilderState {
  pageData: RowData[];
  pagesList: PageEntry[];
  selectedElement: SelectedElement | null;
  
  // History
  past: RowData[][];
  future: RowData[][];
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Selection
  selectElement: (element: SelectedElement | null) => void;

  // CMS Actions
  fetchPagesList: () => Promise<void>;
  createPage: (title: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  updatePageMetadata: (id: string, data: Partial<PageEntry>) => Promise<{ success: boolean; error?: string }>;
  deletePage: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Actions cho Hàng
  addRow: () => void;
  removeRow: (rowId: string) => void;
  updateRowLayout: (rowId: string, layout: '1' | '2' | '3' | '4') => void;
  
  // Actions cho Cột
  addColumn: (rowId: string, span?: number) => void;
  removeColumn: (rowId: string, colId: string) => void;
  
  // Actions cho Khối (Block)
  addBlock: (rowId: string, colId: string, type: BlockType) => void;
  removeBlock: (rowId: string, colId: string, blockId: string) => void;
  updateBlock: (rowId: string, colId: string, blockId: string, data: Partial<BlockData>) => void;

  // Styling & Visibility Actions
  updateElementStyles: (styles: ElementStyles) => void;
  updateElementVisibility: (visibility: ElementVisibility) => void;

  // Persistance
  loadPage: (slug: string) => Promise<void>;
  savePage: (slug: string, isPublished?: boolean) => Promise<{ success: boolean; error?: string }>;
  
  // Templates
  saveAsTemplate: (name: string) => Promise<{ success: boolean; error?: string }>;
  importTemplate: (templateId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  pageData: [],
  pagesList: [],
  selectedElement: null,
  past: [],
  future: [],

  saveHistory: () => set((state) => {
    if (state.past.length > 0) {
      if (JSON.stringify(state.past[state.past.length - 1]) === JSON.stringify(state.pageData)) {
        return state;
      }
    }
    return {
      past: [...state.past, JSON.parse(JSON.stringify(state.pageData))].slice(-50),
      future: []
    };
  }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      future: [JSON.parse(JSON.stringify(state.pageData)), ...state.future].slice(-50),
      pageData: previous
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, JSON.parse(JSON.stringify(state.pageData))].slice(-50),
      future: state.future.slice(1),
      pageData: next
    };
  }),

  selectElement: (element) => set({ selectedElement: element }),

  fetchPagesList: async () => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, is_published, show_in_header')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        set({ pagesList: data });
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    }
  },

  createPage: async (title: string, slug: string) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      // Khởi tạo trang trống
      const emptyContent: RowData[] = [{ 
        id: `row_${Date.now()}`, 
        columns: [{ id: `col_${Date.now()}`, span: 12, blocks: [], styles: {}, visibility: {} }],
        styles: {},
        visibility: {}
      }];

      const { data, error } = await supabase
        .from('pages')
        .insert({ 
          title, 
          slug, 
          page_content: emptyContent,
          is_published: false, // Lần đầu tạo mặc định là bản nháp
          show_in_header: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Cập nhật lại list
      const { pagesList } = get();
      set({ pagesList: [data, ...pagesList] });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error creating page:', err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  },

  updatePageMetadata: async (id: string, data: Partial<PageEntry>) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      const { error } = await supabase
        .from('pages')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      const { pagesList } = get();
      set({ 
        pagesList: pagesList.map(p => p.id === id ? { ...p, ...data } : p) 
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating page metadata:', err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  },

  deletePage: async (id: string) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      const { pagesList } = get();
      set({ 
        pagesList: pagesList.filter(p => p.id !== id) 
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting page:', err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  },
  
  addRow: () => {
    get().saveHistory();
    set((state) => ({
      pageData: [...state.pageData, { 
        id: `row_${Date.now()}`, 
        columns: [{ id: `col_${Date.now()}`, span: 12, blocks: [], styles: {}, visibility: {} }],
        styles: {},
        visibility: {}
      }]
    }));
  },

  removeRow: (rowId: string) => {
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.filter(r => r.id !== rowId),
      selectedElement: state.selectedElement?.rowId === rowId ? null : state.selectedElement
    }));
  },

  updateRowLayout: (rowId: string, layout: '1' | '2' | '3' | '4') => {
    get().saveHistory();
    set((state) => {
      const columnConfigs = {
        '1': [{ span: 12 }],
        '2': [{ span: 6 }, { span: 6 }],
        '3': [{ span: 4 }, { span: 4 }, { span: 4 }],
        '4': [{ span: 3 }, { span: 3 }, { span: 3 }, { span: 3 }]
      } as const;
      
      return {
        pageData: state.pageData.map(row => 
          row.id === rowId 
            ? { 
                ...row, 
                columns: columnConfigs[layout].map((cfg, i) => ({
                  id: `col_${rowId}_${i}_${Date.now()}`,
                  span: cfg.span,
                  blocks: [],
                  styles: {},
                  visibility: {}
                }))
              }
            : row
        )
      };
    });
  },

  addColumn: (rowId: string, span: number = 6) => {
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.map(row => 
        row.id === rowId 
          ? { ...row, columns: [...row.columns, { id: `col_${Date.now()}`, span, blocks: [], styles: {}, visibility: {} }] }
          : row
      )
    }));
  },

  removeColumn: (rowId: string, colId: string) => {
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.map(row => 
        row.id === rowId 
          ? { ...row, columns: row.columns.filter(c => c.id !== colId) }
          : row
      ),
      selectedElement: state.selectedElement?.colId === colId ? null : state.selectedElement
    }));
  },

  addBlock: (rowId: string, colId: string, type: BlockType) => {
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.map(col => 
                col.id === colId 
                  ? { 
                      ...col, 
                      blocks: [...col.blocks, { 
                        id: `block_${Date.now()}`, 
                        type, 
                        content: type === 'text' ? '<h2>Tiêu đề mới</h2><p>Nhập nội dung tại đây...</p>' : '',
                        styles: {},
                        visibility: {}
                      }] 
                    }
                  : col
              )
            }
          : row
      )
    }));
  },

  removeBlock: (rowId: string, colId: string, blockId: string) => {
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.map(col => 
                col.id === colId 
                  ? { ...col, blocks: col.blocks.filter(b => b.id !== blockId) }
                  : col
              )
            }
          : row
      ),
      selectedElement: state.selectedElement?.blockId === blockId ? null : state.selectedElement
    }));
  },

  updateBlock: (rowId: string, colId: string, blockId: string, data: Partial<BlockData>) => {
    // Để ý: Việc chỉnh sửa văn bản (Type) rất dễ làm lịch sử tràn,
    // Ở đây ta gọi saveHistory nhưng sẽ có debounce ngầm định bằng strict text checking.
    // Thực tế nên debounce saveHistory đối với typing. Chấp nhận lưu sau mỗi dòng, 
    // Nhưng vì ta đã kiểm tra state trùng nên nếu text thay đổi nhanh nó sẽ lưu nhiều.
    get().saveHistory();
    set((state) => ({
      pageData: state.pageData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.map(col => 
                col.id === colId 
                  ? {
                      ...col,
                      blocks: col.blocks.map(block => 
                        block.id === blockId ? { ...block, ...data } : block
                      )
                    }
                  : col
              )
            }
          : row
      )
    }));
  },

  updateElementStyles: (styles) => {
    get().saveHistory();
    set((state) => {
      const { selectedElement, pageData } = state;
      if (!selectedElement) return state;

      const newPageData = pageData.map(row => {
        if (row.id !== selectedElement.rowId) return row;

        if (selectedElement.type === 'row') {
          return { ...row, styles: { ...row.styles, ...styles } };
        }

        return {
          ...row,
          columns: row.columns.map(col => {
            if (col.id !== selectedElement.colId) return col;

            if (selectedElement.type === 'col') {
              return { ...col, styles: { ...col.styles, ...styles } };
            }

            return {
              ...col,
              blocks: col.blocks.map(block => {
                if (block.id !== selectedElement.blockId) return block;
                return { ...block, styles: { ...block.styles, ...styles } };
              })
            };
          })
        };
      });

      return { pageData: newPageData };
    });
  },

  updateElementVisibility: (visibility) => {
    get().saveHistory();
    set((state) => {
      const { selectedElement, pageData } = state;
      if (!selectedElement) return state;

      const newPageData = pageData.map(row => {
        if (row.id !== selectedElement.rowId) return row;

        if (selectedElement.type === 'row') {
          return { ...row, visibility: { ...row.visibility, ...visibility } };
        }

        return {
          ...row,
          columns: row.columns.map(col => {
            if (col.id !== selectedElement.colId) return col;

            if (selectedElement.type === 'col') {
              return { ...col, visibility: { ...col.visibility, ...visibility } };
            }

            return {
              ...col,
              blocks: col.blocks.map(block => {
                if (block.id !== selectedElement.blockId) return block;
                return { ...block, visibility: { ...block.visibility, ...visibility } };
              })
            };
          })
        };
      });

      return { pageData: newPageData };
    });
  },

  loadPage: async (slug: string) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('pages')
        .select('page_content')
        .eq('slug', slug)
        .single();

      if (data && !error) {
        set({ pageData: data.page_content as RowData[] });
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    }
  },

  savePage: async (slug: string, isPublished?: boolean) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { pageData } = get();

      const updateData: any = { 
        page_content: pageData,
        updated_at: new Date().toISOString()
      };
      
      if (typeof isPublished === 'boolean') {
        updateData.is_published = isPublished;
      }

      const { error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('slug', slug);

      if (error) {
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error saving page:', err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  },

  saveAsTemplate: async (name: string) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { pageData } = get();

      const { error } = await supabase
        .from('page_templates')
        .insert({ 
          template_name: name,
          content: pageData
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving template:', err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  },

  importTemplate: async (templateId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('page_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (data && !error) {
        set({ pageData: data.content as RowData[] });
      }
    } catch (err) {
      console.error('Failed to import template:', err);
    }
  },
}));
