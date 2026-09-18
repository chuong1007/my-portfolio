const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /<section \n\s*className=\{cn\(/,
  '<section ref={heroRef}\n        className={cn('
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Hero ref');
