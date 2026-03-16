"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Paragraph from '@tiptap/extension-paragraph';
import { Extension } from '@tiptap/core';
import { Bold, Italic, Type, Plus, Minus, CornerDownLeft } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { getResponsiveValue } from '@/lib/responsive-helpers';

// --- Custom Extensions ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
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
    }];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: element => element.style.lineHeight,
          renderHTML: attributes => {
            if (!attributes.lineHeight) return {};
            return { style: `line-height: ${attributes.lineHeight}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight: null }));
      },
    };
  },
});

export type ResponsiveFontSize = {
  mobile: number;
  tablet: number;
  desktop: number;
};

export type ResponsiveContent = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ResponsiveLineHeight = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type RichTextData = {
  content: string | ResponsiveContent;
  fontSize: ResponsiveFontSize;
  lineHeight: ResponsiveLineHeight;
};

type RichTextEditorProps = {
  label: string;
  value: RichTextData | string;
  onChange: (value: RichTextData) => void;
  placeholder?: string;
  enterAsBreak?: boolean;
};

export function RichTextEditor({ label, value, onChange, placeholder, enterAsBreak = false }: RichTextEditorProps) {
  const { globalPreviewMode } = useAdmin();
  const [localFontSize, setLocalFontSize] = useState<ResponsiveFontSize>({
    mobile: 16,
    tablet: 18,
    desktop: 20
  });
  const [localLineHeight, setLocalLineHeight] = useState<ResponsiveLineHeight>({
    mobile: '1.5',
    tablet: '1.5',
    desktop: '1.5'
  });
  const [localContent, setLocalContent] = useState<ResponsiveContent>({
    mobile: '',
    tablet: '',
    desktop: ''
  });
  const isUpdatingRef = useRef(false);

  // Normalize initial value
  const normalize = (v: any): RichTextData => {
    const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
    const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
    const defaultContent = { mobile: '', tablet: '', desktop: '' };

    if (v === null || v === undefined) {
      return { content: defaultContent, fontSize: defaultFS, lineHeight: defaultLH };
    }
    
    if (typeof v === 'string') {
      return { 
        content: { mobile: v, tablet: v, desktop: v }, 
        fontSize: defaultFS,
        lineHeight: defaultLH
      };
    }

    const content = typeof v.content === 'object' && v.content !== null
      ? v.content
      : { mobile: v.content || '', tablet: v.content || '', desktop: v.content || '' };
    
    const fontSize = v.fontSize || defaultFS;
    const lineHeight = v.lineHeight || defaultLH;

    return { content, fontSize, lineHeight };
  };

  const normalizedValue = normalize(value);

  useEffect(() => {
    setLocalFontSize(normalizedValue.fontSize);
    setLocalLineHeight(normalizedValue.lineHeight);
    setLocalContent(normalizedValue.content as ResponsiveContent);
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
        },
      }),
      TextStyle,
      FontSize,
      LineHeight,
      ...(enterAsBreak ? [
        Extension.create({
          name: 'enterHandler',
          addKeyboardShortcuts() {
            return {
              Enter: () => this.editor.commands.setHardBreak(),
            }
          },
        })
      ] : []),
    ],
    content: getResponsiveValue(normalizedValue.content, globalPreviewMode),
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;
      
      const newHTML = editor.getHTML();
      const updatedContent = { ...localContent, [globalPreviewMode]: newHTML };
      setLocalContent(updatedContent);
      
      onChange({
        content: updatedContent,
        fontSize: localFontSize,
        lineHeight: localLineHeight
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] bg-zinc-950 p-4 border border-zinc-800 rounded-xl leading-relaxed',
      },
    },
  });

  // Sync editor content when device mode changes or value changes from outside
  useEffect(() => {
    if (editor) {
      const modeContent = getResponsiveValue(normalizedValue.content, globalPreviewMode);
      const currentHTML = editor.getHTML();
      
      // If content differs and we are either NOT focused or it's a device mode change
      if (currentHTML !== modeContent && !isUpdatingRef.current) {
        // We only force update if not focused to avoid cursor jumps
        // OR if the content is completely different (e.g. from a different device mode)
        if (!editor.isFocused) {
          isUpdatingRef.current = true;
          editor.commands.setContent(modeContent);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);
        }
      }
    }
  }, [globalPreviewMode, value, editor]);

  const currentSize = localFontSize[globalPreviewMode] || 16;

  const updateFontSize = (newSize: number) => {
    const updatedSizes = { ...localFontSize, [globalPreviewMode]: newSize };
    setLocalFontSize(updatedSizes);
    onChange({
      content: localContent,
      fontSize: updatedSizes,
      lineHeight: localLineHeight
    });
  };

  const updateLineHeight = (newLineHeight: string) => {
    const updatedLH = { ...localLineHeight, [globalPreviewMode]: newLineHeight };
    setLocalLineHeight(updatedLH);
    onChange({
      content: localContent,
      fontSize: localFontSize,
      lineHeight: updatedLH
    });
  };

  const currentLineHeight = localLineHeight[globalPreviewMode] || '1.5';

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
          </div>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          {/* Line Height Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">LH</span>
            <select 
              value={currentLineHeight}
              onChange={(e) => updateLineHeight(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="1">1.0</option>
              <option value="1.2">1.2</option>
              <option value="1.4">1.4</option>
              <option value="1.5">1.5</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2">2.0</option>
            </select>
          </div>
          <span className="ml-2 text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold">{globalPreviewMode}</span>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
