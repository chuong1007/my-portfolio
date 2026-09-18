const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/GlobalPopup.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace hardcoded dark popup background with theme variables
content = content.replace(
  /className="relative w-full max-w-2xl backdrop-blur-2xl border border-white\/10 rounded-2xl shadow-2xl overflow-hidden max-h-\[90vh\] flex flex-col"/g,
  'className="relative w-full max-w-2xl backdrop-blur-2xl border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-[var(--bg-surface)]"'
);

// Fix the style to only apply bgColor if it exists
content = content.replace(
  /style=\{\{ backgroundColor: rawContent\?\.bgColor \|\| 'rgba\(24, 24, 27, 0\.9\)' \}\}/g,
  "style={rawContent?.bgColor ? { backgroundColor: rawContent.bgColor } : undefined}"
);

// Fix close button
content = content.replace(
  /className="absolute top-4 right-4 z-10 p-2 bg-black\/30 hover:bg-black\/50 backdrop-blur-md rounded-full text-\[var\(--text-primary\)\] transition-colors border border-white\/10"/g,
  'className="absolute top-4 right-4 z-10 p-2 bg-[var(--bg-elevated)] hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-default)]"'
);

// Fix prose to support both modes
content = content.replace(
  /className="prose prose-invert max-w-none text-\[var\(--text-secondary\)\]/g,
  'className="prose dark:prose-invert max-w-none text-[var(--text-secondary)]'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed GlobalPopup theme support!');
