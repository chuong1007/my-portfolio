const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace font-bold with font-extrabold tracking-tight for line 0 and line 1
content = content.replace(
  /className="flex justify-center font-bold"/g,
  'className="flex justify-center font-extrabold tracking-tight"'
);
content = content.replace(
  /className="w-full flex justify-center"><div className="relative inline-flex justify-center items-center font-bold px-\[0\.12em\]">/g,
  'className="w-full flex justify-center"><div className="relative inline-flex justify-center items-center font-extrabold tracking-tight px-[0.12em]">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed font weight');
