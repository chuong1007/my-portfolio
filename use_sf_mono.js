const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Consolas with SF Mono
content = content.replace(/Consolas, Monaco, "Courier New", Courier, monospace/g, '"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Changed to SF Mono');
