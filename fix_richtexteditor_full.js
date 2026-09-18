const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/RichTextEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports for extensions
const extensionsToAdd = `
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
`;
if (!content.includes('import Underline from')) {
  content = content.replace(
    /import TextAlign from '@tiptap\/extension-text-align';/,
    `import TextAlign from '@tiptap/extension-text-align';${extensionsToAdd}`
  );
}

// 2. Add lucide icons
content = content.replace(
  /Loader2, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify \} from 'lucide-react';/,
  `Loader2, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, List, ListOrdered } from 'lucide-react';`
);

// 3. Add to extensions array
content = content.replace(
  /extensions: \[/,
  `extensions: [
      Underline,
      Strike,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-400 underline cursor-pointer' } }),
      BulletList.configure({ HTMLAttributes: { class: 'list-disc ml-4 space-y-1' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'list-decimal ml-4 space-y-1' } }),
      ListItem,`
);

// 4. Add UI buttons
const standardButtons = `
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('underline') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('strike') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { 
                  e.preventDefault(); 
                  const previousUrl = editor.getAttributes('link').href;
                  const url = window.prompt('URL', previousUrl);
                  if (url === null) return;
                  if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
                  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); 
                }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('link') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('bulletList') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('orderedList') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
`;

content = content.replace(
  /<button\n\s*onClick=\{\(e\) => \{ e\.preventDefault\(\); editor\.chain\(\)\.focus\(\)\.toggleItalic\(\)\.run\(\); \}\}/,
  `<button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                className={\`p-2 rounded hover:bg-zinc-800 text-zinc-400 \${editor.isActive('italic') ? 'text-white bg-zinc-800' : ''}\`}
              >
                <Italic className="w-4 h-4" />
              </button>` + standardButtons + `\n              <button className="hidden" `
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added more tools to RichTextEditor');
