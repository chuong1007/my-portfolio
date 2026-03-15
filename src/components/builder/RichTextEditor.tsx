"use client";

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useAdmin } from "@/context/AdminContext";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Baseline,
  ChevronDown,
  ArrowLeftRight,
  FoldVertical,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  CheckSquare,
  Undo,
  Redo,
  Quote,
  Code,
  Code2,
  List,
  ListOrdered,
  Youtube as YoutubeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SketchPicker } from 'react-color';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    }
    letterSpacing: {
      setLetterSpacing: (spacing: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
    }
    lineHeight: {
      setLineHeight: (height: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    }
  }
}

// Custom Font Size extension using Global Attributes for textStyle
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle', 'heading', 'paragraph'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize} !important` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: size })
          .updateAttributes('heading', { fontSize: size })
          .updateAttributes('paragraph', { fontSize: size })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .updateAttributes('heading', { fontSize: null })
          .updateAttributes('paragraph', { fontSize: null })
          .run();
      },
    };
  },
});

const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() {
    return {
      types: ['textStyle', 'heading', 'paragraph'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing,
            renderHTML: attributes => {
              if (!attributes.letterSpacing) return {};
              return { style: `letter-spacing: ${attributes.letterSpacing} !important` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing: (spacing: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { letterSpacing: spacing })
          .updateAttributes('heading', { letterSpacing: spacing })
          .updateAttributes('paragraph', { letterSpacing: spacing })
          .run();
      },
      unsetLetterSpacing: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { letterSpacing: null })
          .updateAttributes('heading', { letterSpacing: null })
          .updateAttributes('paragraph', { letterSpacing: null })
          .run();
      },
    };
  },
});

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['textStyle', 'heading', 'paragraph'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight} !important` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (height: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { lineHeight: height })
          .updateAttributes('heading', { lineHeight: height })
          .updateAttributes('paragraph', { lineHeight: height })
          .run();
      },
      unsetLineHeight: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { lineHeight: null })
          .updateAttributes('heading', { lineHeight: null })
          .updateAttributes('paragraph', { lineHeight: null })
          .run();
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isPreviewingLocal?: boolean;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Orbitron', value: 'Orbitron' },
];

const SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' },
  { label: '40px', value: '40px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '64px', value: '64px' },
  { label: '72px', value: '72px' },
  { label: '80px', value: '80px' },
  { label: '96px', value: '96px' },
  { label: '112px', value: '112px' },
  { label: '128px', value: '128px' },
];

const SPACINGS = [
  { label: 'Mặc định', value: '' },
  { label: '-0.05em', value: '-0.05em' },
  { label: '-0.025em', value: '-0.025em' },
  { label: '0px', value: '0px' },
  { label: '0.025em', value: '0.025em' },
  { label: '0.05em', value: '0.05em' },
  { label: '0.1em', value: '0.1em' },
  { label: '0.15em', value: '0.15em' },
  { label: '0.2em', value: '0.2em' },
  { label: '0.25em', value: '0.25em' },
  { label: '0.5em', value: '0.5em' },
];

const LINE_HEIGHTS = [
  { label: 'Mặc định', value: '' },
  { label: '1', value: '1' },
  { label: '1.25', value: '1.25' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2', value: '2' },
];


export function RichTextEditor({ content, onChange, isPreviewingLocal, placeholder = "Bắt đầu viết...", className, editable: forceEditable }: RichTextEditorProps) {
  const adminContext = useAdmin();
  const isEditMode = adminContext ? adminContext.isEditMode : true; // Fallback for specialized pages
  const editable = forceEditable !== undefined ? forceEditable : (isEditMode && !isPreviewingLocal);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [showLineHeightMenu, setShowLineHeightMenu] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlSource, setHtmlSource] = useState('');

  const closeAllMenus = () => {
    setShowFontMenu(false);
    setShowSizeMenu(false);
    setShowColorMenu(false);
    setShowSpacingMenu(false);
    setShowLineHeightMenu(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      FontSize,
      LetterSpacing,
      LineHeight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl border border-zinc-800 my-8 shadow-2xl',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden my-8 shadow-2xl mx-auto',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, [editable]);

  if (!editor) return null;

  return (
    <div className={cn(
      "relative transition-all duration-300",
      !isPreviewingLocal ? "overflow-hidden border border-zinc-800/50 rounded-2xl bg-zinc-900/30 backdrop-blur-xl shadow-2xl ring-1 ring-white/5" : "",
      className
    )}>
      {editable && (
        <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md rounded-t-2xl z-20 sticky top-0">
          
          {/* History */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-20 translate-y-[1px]"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-20 translate-y-[1px]"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Basic Formatting */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { editor.chain().focus().toggleBold().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('bold') && "text-white bg-zinc-800")}
              title="In đậm"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleItalic().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('italic') && "text-white bg-zinc-800")}
              title="In nghiêng"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleUnderline().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('underline') && "text-white bg-zinc-800")}
              title="Gạch chân"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleStrike().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('strike') && "text-white bg-zinc-800")}
              title="Gạch ngang"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleCode().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('code') && "text-white bg-zinc-800")}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleHighlight().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('highlight') && "text-amber-400 bg-amber-400/10")}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Lists & Blocks */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { editor.chain().focus().toggleBulletList().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('bulletList') && "text-white bg-zinc-800")}
              title="Danh sách"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleOrderedList().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('orderedList') && "text-white bg-zinc-800")}
              title="Danh sách số"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleTaskList().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('taskList') && "text-white bg-zinc-800")}
              title="Task List"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleBlockquote().run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('blockquote') && "text-white bg-zinc-800")}
              title="Trích dẫn"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
              onClick={() => { editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('heading', { level: level }) && "text-white bg-zinc-800")}
              title={`Heading ${level}`}
            >
              {level === 1 ? <Heading1 className="w-4 h-4" /> : level === 2 ? <Heading2 className="w-4 h-4" /> : <Heading3 className="w-4 h-4" />}
            </button>
          ))}
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Font Family Selector */}
          <div className="relative">
            <button
              onClick={() => { 
                const newState = !showFontMenu;
                closeAllMenus();
                setShowFontMenu(newState);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent",
                showFontMenu && "bg-zinc-800 border-zinc-700 text-white"
              )}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="w-16 truncate text-left">
                {FONTS.find(f => editor.isActive('textStyle', { fontFamily: f.value }) || editor.isActive('heading', { fontFamily: f.value }) || editor.isActive('paragraph', { fontFamily: f.value }))?.label || 'Font'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-zinc-950 border border-zinc-800 rounded-xl p-1 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900 mb-1">
                  Select Font
                </div>
                {FONTS.map(f => (
                  <button
                    key={f.label}
                    onClick={() => {
                      if (f.value) editor.chain().focus().setFontFamily(f.value).run();
                      else editor.chain().focus().unsetFontFamily().run();
                      closeAllMenus();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors",
                      editor.isActive('textStyle', { fontFamily: f.value }) ? "text-blue-500 bg-zinc-900" : "text-zinc-500"
                    )}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Selector */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !showSizeMenu;
                closeAllMenus();
                setShowSizeMenu(newState);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent",
                showSizeMenu && "bg-zinc-800 border-zinc-700 text-white"
              )}
            >
              <span className="w-10 truncate text-left">
                {SIZES.find(s => editor.isActive('textStyle', { fontSize: s.value }) || editor.isActive('heading', { fontSize: s.value }) || editor.isActive('paragraph', { fontSize: s.value }))?.label || 'Size'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSizeMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl p-1 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="p-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900 mb-1">
                  Font Size
                </div>
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => {
                      editor.chain().focus().setFontSize(s.value).run();
                      closeAllMenus();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-zinc-900 transition-colors",
                      editor.isActive('textStyle', { fontSize: s.value }) ? "text-blue-500 bg-zinc-900" : "text-zinc-500"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !showColorMenu;
                closeAllMenus();
                setShowColorMenu(newState);
              }}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded hover:bg-zinc-800 text-zinc-400 transition-all border border-transparent",
                showColorMenu && "bg-zinc-800 border-zinc-700 text-white"
              )}
              title="Màu chữ"
            >
              <Baseline className="w-4 h-4" />
              <div 
                className="w-3 h-3 rounded-full border border-zinc-800"
                style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
              />
            </button>
            {showColorMenu && (
              <div className="absolute top-full right-0 mt-2 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-2xl">
                  <SketchPicker
                    color={editor.getAttributes('textStyle').color || '#ffffff'}
                    onChange={(color) => {
                      editor.chain().focus().setColor(color.hex).run();
                    }}
                    disableAlpha={true}
                    width="220px"
                    className="custom-sketch-picker"
                    styles={{
                      default: {
                        picker: {
                          background: '#1a1a1a',
                          border: 'none',
                          borderRadius: '0',
                          boxShadow: 'none',
                        },
                        saturation: {
                          borderRadius: '8px 8px 0 0',
                        },
                        controls: {
                          background: '#1a1a1a',
                          padding: '12px',
                        },
                      }
                    }}
                  />
                  <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400">
                        {editor.getAttributes('textStyle').color?.toUpperCase() || '#FFFFFF'}
                      </div>
                      <button
                        onClick={() => {
                          editor.chain().focus().unsetColor().run();
                          closeAllMenus();
                        }}
                        className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white border border-zinc-800 rounded-lg transition-colors bg-zinc-950"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Letter Spacing Selector */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !showSpacingMenu;
                closeAllMenus();
                setShowSpacingMenu(newState);
              }}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded hover:bg-zinc-800 text-zinc-400 transition-all border border-transparent",
                showSpacingMenu && "bg-zinc-800 border-zinc-700 text-white"
              )}
              title="Khoảng cách chữ (Kerning)"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            {showSpacingMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl p-1 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="p-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900 mb-1">
                  Letter Spacing
                </div>
                {SPACINGS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => {
                      if (s.value) editor.chain().focus().setLetterSpacing(s.value).run();
                      else editor.chain().focus().unsetLetterSpacing().run();
                      closeAllMenus();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-zinc-900 transition-colors",
                      editor.isActive('textStyle', { letterSpacing: s.value }) ? "text-blue-500 bg-zinc-900" : "text-zinc-500"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Line Height Selector */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !showLineHeightMenu;
                closeAllMenus();
                setShowLineHeightMenu(newState);
              }}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded hover:bg-zinc-800 text-zinc-400 transition-all border border-transparent",
                showLineHeightMenu && "bg-zinc-800 border-zinc-700 text-white"
              )}
              title="Khoảng cách dòng (Line Height)"
            >
              <FoldVertical className="w-4 h-4" />
            </button>
            {showLineHeightMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl p-1 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="p-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900 mb-1">
                  Line Height
                </div>
                {LINE_HEIGHTS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => {
                      if (s.value) editor.chain().focus().setLineHeight(s.value).run();
                      else editor.chain().focus().unsetLineHeight().run();
                      closeAllMenus();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-zinc-900 transition-colors",
                      editor.isActive('textStyle', { lineHeight: s.value }) ? "text-blue-500 bg-zinc-900" : "text-zinc-500"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { editor.chain().focus().setTextAlign('left').run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive({ textAlign: 'left' }) && "text-white bg-zinc-800")}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().setTextAlign('center').run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive({ textAlign: 'center' }) && "text-white bg-zinc-800")}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().setTextAlign('right').run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive({ textAlign: 'right' }) && "text-white bg-zinc-800")}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { editor.chain().focus().setTextAlign('justify').run(); closeAllMenus(); }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive({ textAlign: 'justify' }) && "text-white bg-zinc-800")}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Media & Advanced */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                const url = window.prompt('Nhập địa chỉ Link:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                } else if (url === '') {
                  editor.chain().focus().unsetLink().run();
                }
                closeAllMenus();
              }}
              className={cn("p-2 rounded hover:bg-zinc-800 text-zinc-400", editor.isActive('link') && "text-blue-400 bg-blue-400/10")}
              title="Thêm Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const url = window.prompt('Nhập địa chỉ Ảnh:');
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
                closeAllMenus();
              }}
              className="p-2 rounded hover:bg-zinc-800 text-zinc-400"
              title="Thêm Ảnh (URL)"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const url = window.prompt('Nhập địa chỉ YouTube:');
                if (url) {
                  editor.chain().focus().setYoutubeVideo({ src: url }).run();
                }
                closeAllMenus();
              }}
              className="p-2 rounded hover:bg-zinc-800 text-zinc-400"
              title="Thêm Video YouTube"
            >
              <YoutubeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                closeAllMenus();
              }}
              className="p-2 rounded hover:bg-zinc-800 text-zinc-400"
              title="Thêm Bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* HTML Source Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => {
                closeAllMenus();
                if (!showHtmlEditor) {
                  setHtmlSource(editor.getHTML());
                  setShowHtmlEditor(true);
                } else {
                  editor.commands.setContent(htmlSource, { emitUpdate: false });
                  onChange(htmlSource);
                  setShowHtmlEditor(false);
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all border",
                showHtmlEditor
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "text-zinc-400 hover:bg-zinc-800 border-transparent"
              )}
              title="Chế độ Mã nguồn HTML"
            >
              <Code2 className="w-4 h-4" />
              <span>HTML</span>
            </button>
          </div>
        </div>
      )}

      <div 
        className={cn(
          "relative group flex flex-col", 
          !isPreviewingLocal ? "rounded-b-xl resize-y overflow-hidden min-h-[400px] bg-black/20" : "",
          className
        )}
      >
        {showHtmlEditor && editable ? (
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Chế độ Mã nguồn HTML</span>
            </div>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              className="w-full h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-emerald-400 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-y custom-scrollbar"
              placeholder="Dán hoặc chỉnh sửa mã HTML tại đây..."
              spellCheck={false}
            />
          </div>
        ) : (
          <div className={cn("flex-1", !isPreviewingLocal ? "overflow-y-auto custom-scrollbar p-8 pb-12" : "")}>
            <EditorContent 
              editor={editor} 
              className={cn("prose prose-invert max-w-none focus:outline-none h-full", !isPreviewingLocal ? "custom-tiptap-content" : "")}
            />
          </div>
        )}
        {!isPreviewingLocal && !showHtmlEditor && (
          <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none flex items-end justify-end p-1 text-zinc-600 opacity-50 group-hover:opacity-100 transition-opacity z-10 bg-black/20 rounded-tl">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0L0 10H10V0Z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
      <style jsx global>{`
        .resize-y::-webkit-resizer {
          background-color: transparent; 
        }
        .custom-tiptap-content .ProseMirror {
          min-height: 400px;
          outline: none;
        }
      `}</style>
    </div>
  );
}
