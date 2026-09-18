const fs = require('fs');
const path = require('path');

const files = [
  'src/components/sections/Gallery.tsx',
  'src/components/sections/Blog.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the hardcoded zinc-50/950 colors with CSS variables for the active tab
  content = content.replace(
    /"bg-zinc-50 text-zinc-950 border-zinc-50"/g,
    '"bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)]"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated active tab colors in ${file}`);
});
