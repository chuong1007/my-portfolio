const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Wrap Line 1 in flex justify-center
content = content.replace(
  /<div className="relative inline-flex justify-center items-center font-bold px-\[0\.12em\]">/,
  '<div className="w-full flex justify-center"><div className="relative inline-flex justify-center items-center font-bold px-[0.12em]">'
);

// We need to add the closing div for this wrapper
// The Line 1 block ends before: {/* ── LINE 2: "based in..." ── */}
const line2Marker = '{/* ── LINE 2: "based in..." ── */}';
content = content.replace(
  /      \{\/\* ── LINE 2: "based in\.\.\." ── \*\/\}/,
  '      </div>\n      {/* ── LINE 2: "based in..." ── */}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed yellow box centering');
