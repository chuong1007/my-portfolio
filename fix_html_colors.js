const fs = require('fs');
const path = require('path');

const files = [
  'src/components/sections/About.tsx',
  'src/components/sections/Contact.tsx',
  'src/components/sections/Gallery.tsx',
  'src/components/sections/Hero.tsx',
  'src/components/sections/Blog.tsx',
  'src/components/ProjectDetail.tsx',
  'src/components/BlogDetail.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace the old cleanHtmlColors function with a more aggressive one
  const oldFuncRegex = /const cleanHtmlColors = \(html\?: string \| null\) => {[\s\S]*?};\n/;
  const newFunc = `const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  return html
    .replace(/color:\\s*(?:#ffffff|#fff|rgb\\(255,\\s*255,\\s*255\\))/gi, 'color: var(--text-primary)')
    .replace(/-webkit-text-fill-color:\\s*transparent/gi, '')
    .replace(/background:\\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\\s*text/gi, '');
};\n`;

  if (oldFuncRegex.test(content)) {
    content = content.replace(oldFuncRegex, newFunc);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated cleanHtmlColors in ${file}`);
  }
});
