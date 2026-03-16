"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Extension } from '@tiptap/core';
import { Bold, Italic, Type, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';

// --- Custom Font Size Extension ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

export type ResponsiveFontSize = {
  mobile: number;
  tablet: number;
  desktop: number;
};

export type RichTextData = {
  content: string;
  fontSize: ResponsiveFontSize;
};

type RichTextEditorProps = {
  label: string;
  value: RichTextData | string;
  onChange: (value: RichTextData) => void;
  placeholder?: string;
};

export function RichTextEditor({ label, value, onChange, placeholder }: RichTextEditorProps) {
  const { globalPreviewMode } = useAdmin();
  const [localFontSize, setLocalFontSize] = useState<ResponsiveFontSize>({
    mobile: 16,
    tablet: 18,
    desktop: 20
  });

  // Normalize initial value
  const normalizedValue: RichTextData = typeof value === 'string' 
    ? { content: value, fontSize: { mobile: 16, tablet: 18, desktop: 20 } }
    : value;

  useEffect(() => {
    if (normalizedValue.fontSize) {
      setLocalFontSize(normalizedValue.fontSize);
    }
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Paragraph,
      Text,
    ],
    content: normalizedValue.content,
    onUpdate: ({ editor }) => {
      onChange({
        content: editor.getHTML(),
        fontSize: localFontSize
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] bg-zinc-950 p-4 border border-zinc-800 rounded-xl leading-relaxed',
      },
    },
  });

  // Sync editor content when value changes from outside (e.g. section change)
  useEffect(() => {
    if (editor && normalizedValue.content !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue.content);
    }
  }, [normalizedValue.content, editor]);

  const currentSize = localFontSize[globalPreviewMode] || 16;

  const updateFontSize = (newSize: number) => {
    const updatedSizes = { ...localFontSize, [globalPreviewMode]: newSize };
    setLocalFontSize(updatedSizes);
    onChange({
      content: editor?.getHTML() || '',
      fontSize: updatedSizes
    });
  };

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</label>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-1.5 rounded transition-colors",
              editor.isActive('bold') ? "bg-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            )}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-1.5 rounded transition-colors",
              editor.isActive('italic') ? "bg-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            )}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950 rounded border border-zinc-800 ml-1">
            <Type className="w-3 h-3 text-zinc-500" />
            <input 
              type="number"
              value={currentSize}
              onChange={(e) => updateFontSize(parseInt(e.target.value) || 16)}
              className="w-8 bg-transparent text-[10px] font-bold text-center focus:outline-none text-blue-400"
            />
            <span className="text-[10px] text-zinc-600 font-bold uppercase">px</span>
            <div className="flex flex-col gap-0.5 ml-1">
                <button onClick={() => updateFontSize(currentSize + 1)} className="hover:text-zinc-300"><Plus className="w-2.5 h-2.5" /></button>
                <button onClick={() => updateFontSize(Math.max(8, currentSize - 1))} className="hover:text-zinc-300"><Minus className="w-2.5 h-2.5" /></button>
            </div>
            <span className="ml-2 text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">{globalPreviewMode}</span>
          </div>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
