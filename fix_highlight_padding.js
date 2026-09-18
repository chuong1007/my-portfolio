const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add horizontal padding to the container for better left/right balance
content = content.replace(
  /<div className="relative inline-block font-bold">/g,
  '<div className="relative inline-block font-bold px-[0.15em]">'
);

// Fix the black text alignment by removing flex items-center and using exact overlap
// so it shares the same rendering baseline as the base text
content = content.replace(
  /<span className="text-\[#09090b\] absolute left-0 top-0 h-full flex items-center">/g,
  '<span className="text-[#09090b] absolute left-0 top-0 w-full h-full flex items-center justify-center pt-[0.05em]">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed highlight padding!');
