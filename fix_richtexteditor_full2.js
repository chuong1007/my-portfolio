const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/RichTextEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const standardButtons = `
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn("p-1.5 rounded transition-colors", editor.isActive('underline') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
              title="Underline"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn("p-1.5 rounded transition-colors", editor.isActive('strike') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { 
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); 
              }}
              className={cn("p-1.5 rounded transition-colors", editor.isActive('link') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn("p-1.5 rounded transition-colors", editor.isActive('bulletList') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn("p-1.5 rounded transition-colors", editor.isActive('orderedList') ? "bg-zinc-800 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
`;

content = content.replace(
  /\{\/\* Color Picker Toolbar Item \*\/\}/,
  standardButtons + '\n            {/* Color Picker Toolbar Item */}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added buttons to correct place');
