"use client";

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useAdmin } from "@/context/AdminContext";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Baseline,
  ChevronDown,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isPreviewingLocal?: boolean;
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

const COLORS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Gray', value: '#a1a1aa' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Yellow', value: '#eab308' },
];

export function RichTextEditor({ content, onChange, isPreviewingLocal }: RichTextEditorProps) {
  const { isEditMode } = useAdmin();
  const editable = isEditMode && !isPreviewingLocal;
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const closeAllMenus = () => {
    setShowFontMenu(false);
    setShowSizeMenu(false);
    setShowColorMenu(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      FontSize,
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
      "relative",
      !isPreviewingLocal ? "overflow-hidden border border-zinc-800 rounded-xl bg-zinc-900/50" : ""
    )}>
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900 rounded-t-xl z-20">
        
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
        </div>

        <div className="w-px h-6 bg-zinc-800 mx-1" />

        {/* Headings */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => { editor.chain().focus().toggleHeading({ level: level as any }).run(); closeAllMenus(); }}
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
                    (editor.chain().focus() as any).setFontSize(s.value).run();
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
            <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3">Text Color</div>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      editor.chain().focus().setColor(c.value).run();
                      closeAllMenus();
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-125",
                      editor.isActive('textStyle', { color: c.value }) && "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  closeAllMenus();
                }}
                className="w-full mt-4 text-[9px] uppercase font-black tracking-widest text-zinc-500 hover:text-white py-2 border border-zinc-900 rounded-lg transition-colors"
              >
                Reset Color
              </button>
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
      </div>
    )}
      <div 
        className={cn(
          "relative group flex flex-col", 
          !isPreviewingLocal ? "rounded-b-xl resize-y overflow-hidden min-h-[300px] bg-black/20" : ""
        )}
      >
        <div className={cn("flex-1", !isPreviewingLocal ? "overflow-y-auto custom-scrollbar p-8 pb-12" : "")}>
          <EditorContent 
            editor={editor} 
            className={cn("prose prose-invert max-w-none focus:outline-none h-full", !isPreviewingLocal ? "custom-tiptap-content" : "")}
          />
        </div>
        {!isPreviewingLocal && (
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
          min-height: 250px;
          outline: none;
        }
        .custom-tiptap-content span[style*="font-size"],
        .custom-tiptap-content h1[style*="font-size"],
        .custom-tiptap-content h2[style*="font-size"],
        .custom-tiptap-content h3[style*="font-size"],
        .custom-tiptap-content p[style*="font-size"] {
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}
