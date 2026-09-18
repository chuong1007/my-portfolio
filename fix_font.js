const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the span to force monospace font and make sure it looks distinct
content = content.replace(
  /className="text-\[#09090b\] absolute inset-0 flex items-center justify-center( font-mono)?"\s+style=\{\{\s*top:\s*'-0\.1em',\s*bottom:\s*'0\.06em'\s*\}\}/g,
  `className="text-[#09090b] absolute inset-0 flex items-center justify-center"
            style={{ top: '-0.1em', bottom: '0.06em', fontFamily: 'monospace, "Courier New", Courier' }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Font fixed');
