"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Paragraph from '@tiptap/extension-paragraph';
import { Extension } from '@tiptap/core';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

import Image from '@tiptap/extension-image';
import { Bold, Italic, Type, Plus, Minus, CornerDownLeft, FoldVertical, MoveHorizontal, Image as ImageIcon, Loader2, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, List, ListOrdered } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { getResponsiveValue } from '@/lib/responsive-helpers';
import { SketchPicker } from 'react-color';
import { compressImage } from '@/lib/compressImage';
import { createClient } from '@/lib/supabase';

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
    fontWeight: {
      setFontWeight: (weight: string) => ReturnType;
      unsetFontWeight: () => ReturnType;
    };
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';

const FontWeight = Extension.create({
  name: 'fontWeight',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontWeight: {
          default: null,
          parseHTML: element => element.style.fontWeight,
          renderHTML: attributes => {
            if (!attributes.fontWeight) return {};
            return { style: `font-weight: ${attributes.fontWeight}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontWeight: fontWeight => ({ chain }) => chain().setMark('textStyle', { fontWeight }).run(),
      unsetFontWeight: () => ({ chain }) => chain().setMark('textStyle', { fontWeight: null }).removeEmptyTextStyle().run(),
    };
  },
});

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

export type ResponsiveLetterSpacing = {
  desktop?: string;
  tablet?: string;
  mobile?: string;
};

export type ResponsiveLineHeight = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ResponsiveFontFamily = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ResponsiveFontWeight = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ResponsiveColor = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type RichTextData = {
  content: string | ResponsiveContent;
  fontSize: ResponsiveFontSize;
  lineHeight: ResponsiveLineHeight;
  letterSpacing?: ResponsiveLetterSpacing;
  fontFamily?: ResponsiveFontFamily;
  fontWeight?: ResponsiveFontWeight;
  textColor?: ResponsiveColor;
};

type RichTextEditorProps = {
  label: string;
  value: RichTextData | string;
  onChange: (value: RichTextData) => void;
  placeholder?: string;
  enterAsBreak?: boolean;
  hideLineHeight?: boolean;
  hideLetterSpacing?: boolean;
};

export function RichTextEditor({ label, value, onChange, placeholder, enterAsBreak = false, hideLineHeight = false, hideLetterSpacing = false }: RichTextEditorProps) {
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
  const [localLetterSpacing, setLocalLetterSpacing] = useState<ResponsiveLetterSpacing>({
    mobile: '0',
    tablet: '0',
    desktop: '0'
  });
  const [localFontFamily, setLocalFontFamily] = useState<ResponsiveFontFamily>({
    mobile: 'inherit',
    tablet: 'inherit',
    desktop: 'inherit'
  });
  const [localFontWeight, setLocalFontWeight] = useState<ResponsiveFontWeight>({
    mobile: '400',
    tablet: '400',
    desktop: '400'
  });
  const [localTextColor, setLocalTextColor] = useState<ResponsiveColor>({
    mobile: 'inherit',
    tablet: 'inherit',
    desktop: 'inherit'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localContent, setLocalContent] = useState<ResponsiveContent>({
    mobile: '',
    tablet: '',
    desktop: ''
  });
  const isUpdatingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.82,
        maxSizeMB: 1,
      });

      const supabase = createClient();
      const fileExt = compressed.name.split('.').pop();
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, compressed, {
          cacheControl: '3600',
          upsert: false,
          contentType: compressed.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      if (editor) {
        editor.chain().focus().setImage({ src: data.publicUrl }).run();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Lỗi khi tải ảnh lên: ${err instanceof Error ? err.message : "Vui lòng thử lại."}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Normalize initial value
  const normalize = (v: any): RichTextData => {
    const defaultFS = { mobile: 16, tablet: 18, desktop: 20 };
    const defaultLH = { mobile: '1.5', tablet: '1.5', desktop: '1.5' };
    const defaultFF = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };
    const defaultFW = { mobile: '400', tablet: '400', desktop: '400' };
    const defaultColor = { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' };
    const defaultLS = { mobile: '0', tablet: '0', desktop: '0' };
    const defaultContent = { mobile: '', tablet: '', desktop: '' };

    const fillKeys = (obj: any, def: any) => {
      if (!obj || typeof obj !== 'object') return def;
      const desk = obj.desktop ?? def.desktop;
      return {
        desktop: desk,
        tablet: obj.tablet ?? desk,
        mobile: obj.mobile ?? obj.tablet ?? desk,
      };
    };

    if (v === null || v === undefined) {
      return { content: defaultContent, fontSize: defaultFS, lineHeight: defaultLH, fontFamily: defaultFF, fontWeight: defaultFW, textColor: defaultColor, letterSpacing: defaultLS };
    }
    if (typeof v === 'string') {
      return { content: { mobile: v, tablet: v, desktop: v }, fontSize: defaultFS, lineHeight: defaultLH, fontFamily: defaultFF, fontWeight: defaultFW, textColor: defaultColor, letterSpacing: defaultLS };
    }
    
    return {
      content: typeof v.content === 'object' && v.content !== null ? fillKeys(v.content, defaultContent) : { mobile: v.content || '', tablet: v.content || '', desktop: v.content || '' },
      fontSize: fillKeys(v.fontSize, defaultFS),
      lineHeight: fillKeys(v.lineHeight, defaultLH),
      fontFamily: fillKeys(v.fontFamily, defaultFF),
      fontWeight: fillKeys(v.fontWeight, defaultFW),
      textColor: fillKeys(v.textColor, defaultColor),
      letterSpacing: fillKeys(v.letterSpacing, defaultLS),
    };
  };

  const normalizedValue = normalize(value);

  useEffect(() => {
    setLocalFontSize(normalizedValue.fontSize);
    setLocalLineHeight(normalizedValue.lineHeight);
    setLocalLetterSpacing(normalizedValue.letterSpacing || { mobile: '0', tablet: '0', desktop: '0' });
    setLocalFontFamily(normalizedValue.fontFamily || { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' });
    setLocalFontWeight(normalizedValue.fontWeight || { mobile: '400', tablet: '400', desktop: '400' });
    setLocalTextColor(normalizedValue.textColor || { mobile: 'inherit', tablet: 'inherit', desktop: 'inherit' });
    setLocalContent(normalizedValue.content as ResponsiveContent);
  }, [value]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Underline,
      Strike,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-400 underline cursor-pointer' } }),
      BulletList.configure({ HTMLAttributes: { class: 'list-disc ml-4 space-y-1' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'list-decimal ml-4 space-y-1' } }),
      ListItem,
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto',
        },
      }),
      TextStyle,
      FontSize,
      LineHeight,
      FontFamily,
      FontWeight,
      Color,
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
        lineHeight: localLineHeight,
        fontFamily: localFontFamily,
        fontWeight: localFontWeight,
        textColor: localTextColor,
        letterSpacing: localLetterSpacing
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] bg-[var(--bg-base)] p-4 border border-[var(--border-default)] rounded-xl leading-relaxed',
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

  const currentSize = localFontSize[globalPreviewMode || 'desktop'] || 16;

  const updateFontSize = (newSize: number) => {
    const updatedSizes = { ...localFontSize, [globalPreviewMode]: newSize };
    setLocalFontSize(updatedSizes);
    onChange({
      content: localContent,
      fontSize: updatedSizes,
      lineHeight: localLineHeight,
      fontFamily: localFontFamily,
      fontWeight: localFontWeight,
      textColor: localTextColor,
        letterSpacing: localLetterSpacing
      });
  };

  const updateLineHeight = (newLineHeight: string) => {
    const updatedLH = { ...localLineHeight, [globalPreviewMode]: newLineHeight };
    setLocalLineHeight(updatedLH);
    onChange({
      content: localContent,
      fontSize: localFontSize,
      lineHeight: updatedLH,
      fontFamily: localFontFamily,
      fontWeight: localFontWeight,
      textColor: localTextColor,
        letterSpacing: localLetterSpacing
      });
  };

  const updateFontFamily = (newFF: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const isSelection = from !== to;

    if (isSelection) {
      editor.chain().focus().setFontFamily(newFF).run();
    } else {
      const updatedFF = { ...localFontFamily, [globalPreviewMode]: newFF };
      setLocalFontFamily(updatedFF);
      editor.chain().focus().setFontFamily(newFF).run();
      onChange({
        content: localContent,
        fontSize: localFontSize,
        lineHeight: localLineHeight,
        fontFamily: updatedFF,
        fontWeight: localFontWeight,
        textColor: localTextColor,
        letterSpacing: localLetterSpacing
      });
    }
  };

  const updateFontWeight = (newFW: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const isSelection = from !== to;

    if (isSelection) {
      editor.chain().focus().setFontWeight(newFW).run();
    } else {
      const updatedFW = { ...localFontWeight, [globalPreviewMode]: newFW };
      setLocalFontWeight(updatedFW);
      editor.chain().focus().setFontWeight(newFW).run();
      onChange({
        content: localContent,
        fontSize: localFontSize,
        lineHeight: localLineHeight,
        fontFamily: localFontFamily,
        fontWeight: updatedFW,
        textColor: localTextColor,
        letterSpacing: localLetterSpacing
      });
    }
  };

  const updateTextColor = (newColor: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const isSelection = from !== to;

    if (isSelection) {
      editor.chain().focus().setColor(newColor).run();
    } else {
      const updatedColor = { ...localTextColor, [globalPreviewMode]: newColor };
      setLocalTextColor(updatedColor);
      editor.chain().focus().setColor(newColor).run();
      onChange({
        content: localContent,
        fontSize: localFontSize,
        lineHeight: localLineHeight,
        fontFamily: localFontFamily,
        fontWeight: localFontWeight,
        textColor: updatedColor,
        letterSpacing: localLetterSpacing
      });
    }
  };

  const currentLineHeight = localLineHeight[globalPreviewMode || 'desktop'] || '1.5';
  const currentLetterSpacing = localLetterSpacing[globalPreviewMode || 'desktop'] ?? '0';

  const updateLetterSpacing = (newSpacing: string) => {
    const mode = globalPreviewMode || 'desktop';
    const updated = { ...localLetterSpacing, [mode]: newSpacing };
    setLocalLetterSpacing(updated);
    onChange({
      content: localContent,
      fontSize: localFontSize,
      lineHeight: localLineHeight,
      fontFamily: localFontFamily,
      fontWeight: localFontWeight,
      textColor: localTextColor,
      letterSpacing: updated
    });
  };
  const baseFontFamily = localFontFamily[globalPreviewMode || 'desktop'] || 'inherit';
  const baseFontWeight = localFontWeight[globalPreviewMode || 'desktop'] || '400';

  // Determine current weight/family at selection/cursor for dropdown display
  const selectionAttributes = editor?.getAttributes('textStyle') || {};
  const currentFontFamily = selectionAttributes.fontFamily || baseFontFamily;
  const currentFontWeight = selectionAttributes.fontWeight || baseFontWeight;
  const currentTextColor = selectionAttributes.color || localTextColor[globalPreviewMode || 'desktop'] || '#FFFFFF';

  const FONT_FAMILIES = [
    { label: 'Default', value: 'inherit' },
    { label: 'Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'ui-serif, Georgia, serif' },
    { label: 'Mono', value: 'ui-monospace, SFMono-Regular, monospace' },
    { label: 'Geist', value: 'var(--font-geist-sans)' },
    { label: 'Inter', value: 'var(--font-inter)' },
    { label: 'Outfit', value: 'var(--font-outfit)' },
    { label: 'Syne', value: 'var(--font-syne)' },
    { label: 'Montserrat', value: 'var(--font-montserrat)' },
  ];

  const FONT_WEIGHTS = [
    { label: 'Thin', value: '100' },
    { label: 'Extra Light', value: '200' },
    { label: 'Light', value: '300' },
    { label: 'Regular', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extra Bold', value: '800' },
    { label: 'Black', value: '900' },
  ];

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{label}</label>
          <span className="text-[9px] bg-zinc-800/50 text-[var(--text-muted)] px-1.5 py-0.5 rounded uppercase font-bold border border-zinc-700/50">{globalPreviewMode}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5 p-1 bg-zinc-900/50 border border-[var(--border-default)] rounded-xl overflow-hidden shadow-inner">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1">
          
          {/* Main Formatting Tools */}
          <div className="flex flex-wrap items-center gap-0.5 bg-[var(--bg-base)] p-1 rounded-lg border border-zinc-800/50">
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('bold') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('italic') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('underline') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('strike') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
            
            <div className="w-px h-4 bg-zinc-800 mx-0.5" />
            
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'left' }) ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'center' }) ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'right' }) ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'justify' }) ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Justify"><AlignJustify className="w-3.5 h-3.5" /></button>
            
            <div className="w-px h-4 bg-zinc-800 mx-0.5" />
            
            <button onClick={(e) => { e.preventDefault(); const previousUrl = editor.getAttributes('link').href; const url = window.prompt('URL', previousUrl); if (url === null) return; if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; } editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('link') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('bulletList') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Bullet List"><List className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={cn("p-1.5 rounded transition-colors", editor.isActive('orderedList') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }} className={cn("p-1.5 rounded transition-colors", "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")} title="Horizontal Line"><Minus className="w-3.5 h-3.5" /></button>

            {/* Color Picker Toolbar Item */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={cn(
                  "p-1.5 rounded transition-colors group relative",
                  showColorPicker ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
                title="Màu chữ"
              >
                <Palette className="w-3.5 h-3.5" />
                <div 
                  className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-[var(--border-subtle)] shadow-sm"
                  style={{ backgroundColor: currentTextColor }}
                />
              </button>
              
              {showColorPicker && (
                <div className="absolute top-10 left-0 z-[100]">
                  <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                  <div className="relative z-[101] bg-[#1a1a1a] border border-[#222] rounded-xl shadow-2xl p-2">
                    <SketchPicker
                      color={currentTextColor === 'inherit' ? '#FFFFFF' : currentTextColor}
                      onChange={(color) => updateTextColor(color.hex)}
                      className="!bg-[#222] !shadow-none !border-none"
                      styles={{
                        default: {
                          picker: { background: '#222', borderRadius: '8px', border: '1px solid #333' }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-50"
              title="Chèn ảnh"
            >
              {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <ImageIcon className="w-3.5 h-3.5" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--bg-base)] px-2 py-1 rounded-lg border border-[var(--border-default)]">
             <select 
               value={currentFontFamily}
               onChange={(e) => updateFontFamily(e.target.value)}
               className="bg-transparent text-[11px] font-bold text-[var(--text-muted)] focus:outline-none cursor-pointer hover:text-[var(--text-secondary)]"
             >
               {FONT_FAMILIES.map(ff => (
                 <option key={ff.value} value={ff.value} className="bg-[var(--bg-surface)] text-[var(--text-secondary)]">{ff.label}</option>
               ))}
             </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--bg-base)] px-2 py-1 rounded-lg border border-[var(--border-default)]">
             <select 
               value={currentFontWeight}
               onChange={(e) => updateFontWeight(e.target.value)}
               className="bg-transparent text-[11px] font-bold text-[var(--text-muted)] focus:outline-none cursor-pointer hover:text-[var(--text-secondary)]"
             >
               {FONT_WEIGHTS.map(fw => (
                 <option key={fw.value} value={fw.value} className="bg-[var(--bg-surface)] text-[var(--text-secondary)]">{fw.label}</option>
               ))}
             </select>
          </div>
          
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          
          <div className="flex items-center gap-3 px-3 py-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)] group/slider">
            <div className="flex items-center gap-1.5 min-w-[50px]">
              <Type className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <div className="flex items-baseline gap-0.5">
                <input 
                  type="number"
                  value={currentSize}
                  onChange={(e) => updateFontSize(parseInt(e.target.value) || 16)}
                  className="w-8 bg-transparent text-[11px] font-bold text-center focus:outline-none text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[9px] text-zinc-600 font-black uppercase">px</span>
              </div>
            </div>
            
            <input
              type="range"
              min="8"
              max="200"
              value={currentSize}
              onChange={(e) => updateFontSize(parseInt(e.target.value))}
              className="w-20 md:w-32 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            
            <div className="flex flex-col gap-0.5 pr-1">
                <button onClick={() => updateFontSize(currentSize + 1)} className="text-[var(--text-muted)] hover:text-blue-400 transition-colors"><Plus className="w-2.5 h-2.5" /></button>
                <button onClick={() => updateFontSize(Math.max(8, currentSize - 1))} className="text-[var(--text-muted)] hover:text-blue-400 transition-colors"><Minus className="w-2.5 h-2.5" /></button>
            </div>
          </div>
        </div>

        {(!hideLineHeight || !hideLetterSpacing) && (
          <div className="px-1 pb-1 flex flex-col gap-1">
            {!hideLineHeight && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)] group/slider">
                <div className="flex items-center gap-1.5 min-w-[50px]">
                  <FoldVertical className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <div className="flex items-baseline gap-0.5">
                    <input 
                      type="number"
                      step="0.1"
                      value={currentLineHeight}
                      onChange={(e) => updateLineHeight(e.target.value)}
                      className="w-8 bg-transparent text-[11px] font-bold text-center focus:outline-none text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-zinc-600 font-black uppercase">lh</span>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.1"
                  value={currentLineHeight}
                  onChange={(e) => updateLineHeight(e.target.value)}
                  className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                />
              </div>
            )}
            
            {!hideLetterSpacing && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)] group/slider">
                <div className="flex items-center gap-1.5 min-w-[50px]">
                  <MoveHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <div className="flex items-baseline gap-0.5">
                    <input 
                      type="number"
                      step="0.1"
                      value={currentLetterSpacing}
                      onChange={(e) => updateLetterSpacing(e.target.value)}
                      className="w-8 bg-transparent text-[11px] font-bold text-center focus:outline-none text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-zinc-600 font-black uppercase">ls</span>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="-5"
                  max="20"
                  step="0.5"
                  value={currentLetterSpacing}
                  onChange={(e) => updateLetterSpacing(e.target.value)}
                  className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[100px] p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 shadow-inner">
        <EditorContent editor={editor} className="prose prose-invert max-w-none text-[var(--text-secondary)] [&_.ProseMirror]:outline-none" />
      </div>
    </div>
  );
}
