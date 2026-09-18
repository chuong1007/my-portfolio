const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/GlobalPopup.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Revert background color logic to original but keep it flexible
content = content.replace(
  /className="relative w-full max-w-2xl backdrop-blur-2xl border border-\[var\(--border-default\)\] rounded-2xl shadow-2xl overflow-hidden max-h-\[90vh\] flex flex-col bg-\[var\(--bg-surface\)\]"/g,
  'className="relative w-full max-w-2xl backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"'
);

// Revert style logic to always use dark by default if empty
content = content.replace(
  /style=\{rawContent\?\.bgColor \? \{ backgroundColor: rawContent\.bgColor \} : undefined\}/g,
  "style={{ backgroundColor: rawContent?.bgColor || 'rgba(24, 24, 27, 0.9)' }}"
);

// Fix the close button to always be visible (white/light) since the popup is dark
content = content.replace(
  /className="absolute top-4 right-4 z-10 p-2 bg-\[var\(--bg-elevated\)\] hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md rounded-full text-\[var\(--text-muted\)\] hover:text-\[var\(--text-primary\)\] transition-colors border border-\[var\(--border-default\)\]"/g,
  'className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"'
);

// Revert prose to always be prose-invert since popup is dark
content = content.replace(
  /className="prose dark:prose-invert max-w-none text-\[var\(--text-secondary\)\]/g,
  'className="prose prose-invert max-w-none text-zinc-300'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Reverted GlobalPopup and fixed X button');
