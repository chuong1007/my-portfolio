const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the highlight mask inner span
content = content.replace(
  /<span className="text-\[#09090b\] absolute left-0 top-0 w-full h-full flex items-center justify-center pt-\[0\.05em\]">/g,
  '<span className="text-[#09090b] absolute inset-0 flex items-center justify-center -mt-[0.05em]">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed highlight overlap!');
