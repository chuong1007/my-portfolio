const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/RichTextEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add TextAlign import if missing
if (!content.includes('@tiptap/extension-text-align')) {
  content = content.replace(
    /import { Extension } from '@tiptap\/core';/,
    `import { Extension } from '@tiptap/core';\nimport TextAlign from '@tiptap/extension-text-align';`
  );
}

// Add Alignment icons to lucide-react import
content = content.replace(
  /import \{ Bold, Italic, Type, Plus, Minus, CornerDownLeft, FoldVertical, Image as ImageIcon, Loader2, Palette \} from 'lucide-react';/,
  `import { Bold, Italic, Type, Plus, Minus, CornerDownLeft, FoldVertical, Image as ImageIcon, Loader2, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';`
);

// Add TextAlign to extensions array
content = content.replace(
  /extensions: \[/,
  `extensions: [\n      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),`
);

// Add Alignment buttons to the toolbar UI
const alignButtons = `
            {/* Alignment */}
            <div className="flex items-center gap-0.5 bg-zinc-900/50 p-1 rounded-lg">
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive({ textAlign: 'left' }) ? 'text-white bg-zinc-800' : ''}\`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive({ textAlign: 'center' }) ? 'text-white bg-zinc-800' : ''}\`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive({ textAlign: 'right' }) ? 'text-white bg-zinc-800' : ''}\`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive({ textAlign: 'justify' }) ? 'text-white bg-zinc-800' : ''}\`}
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-zinc-800 mx-1" />
`;

content = content.replace(
  /\{\/\* Font Tools \*\/\}/,
  alignButtons + '\n            {/* Font Tools */}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed standard RichTextEditor tools');
