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

  // Fix missing closing brace
  content = content.replace(/(__html:\s*cleanHtmlColors\([^}]*\))\s*}(?!\})/g, '$1 }}');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
