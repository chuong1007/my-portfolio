const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /<section ref=\{heroRef\} className="hero-container"\s*className=\{cn\(\s*"relative flex flex-col items-center justify-start px-4 text-center min-h-\[90vh\]",\s*\)\}/,
  `<section ref={heroRef}
        className={cn(
          "hero-container relative flex flex-col items-center justify-start px-4 text-center min-h-[90vh]",
          !isEditor && "not-is-editor",
          isEditor && "is-editor"
        )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Hero className');
