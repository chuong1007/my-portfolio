const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /<motion\.h1\s+className=\{cn\(\s*"tracking-tighter text-\[var\(--text-primary\)\] text-balance mx-auto whitespace-pre-wrap transition-all duration-300",\s*!isEditor && "text-\[length:var\(--fs-mob\)\] md:text-\[length:var\(--fs-tab\)\] lg:text-\[length:var\(--fs-desk\)\]"\s*\)\}/,
  `<motion.h1
            className={cn("hero-title", isEditor && "is-editor",
              "tracking-tighter text-[var(--text-primary)] text-balance mx-auto whitespace-pre-wrap transition-all duration-300"
            )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed h1 CSS');
