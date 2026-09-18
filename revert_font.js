const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove from the invisible placeholder
content = content.replace(
  /style=\{\{\s*fontFamily:\s*`"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,\s*letterSpacing:\s*"-0.05em"\s*\}\}/g,
  ''
);

// Remove from the black text
content = content.replace(
  /style=\{\{\s*top:\s*'-0.1em',\s*bottom:\s*'0.06em',\s*fontFamily:\s*`"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,\s*letterSpacing:\s*"-0.05em"\s*\}\}/g,
  "style={{ top: '-0.1em', bottom: '0.06em' }}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Reverted font');
