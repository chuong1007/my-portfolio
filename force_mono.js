const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The invisible placeholder
content = content.replace(
  /<span className="opacity-0 font-mono whitespace-nowrap pointer-events-none">/g,
  '<span className="opacity-0 whitespace-nowrap pointer-events-none" style={{ fontFamily: `Consolas, Monaco, "Courier New", Courier, monospace`, letterSpacing: "-0.05em" }}>'
);

// The black text
content = content.replace(
  /<span\s*className="text-\[#09090b\] absolute inset-0 flex items-center justify-center font-mono whitespace-nowrap"\s*style=\{\{\s*top:\s*'-0\.1em',\s*bottom:\s*'0\.06em'\s*\}\}\s*>/g,
  `<span
            className="text-[#09090b] absolute inset-0 flex items-center justify-center whitespace-nowrap"
            style={{ top: '-0.1em', bottom: '0.06em', fontFamily: \`Consolas, Monaco, "Courier New", Courier, monospace\`, letterSpacing: "-0.05em" }}
          >`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Forced mono font');
