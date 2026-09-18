const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Change `flex` to `inline-flex` for Line 1
content = content.replace(
  /<div className="relative flex justify-center items-center font-bold px-\[0\.12em\]">/,
  '<div className="relative inline-flex justify-center items-center font-bold px-[0.12em]">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed yellow box width (changed flex to inline-flex)');
