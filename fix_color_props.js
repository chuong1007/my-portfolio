const fs = require('fs');
const path = require('path');

const files = [
  'src/components/sections/About.tsx',
  'src/components/sections/Contact.tsx',
  'src/components/sections/Gallery.tsx',
  'src/components/sections/Hero.tsx',
  'src/components/sections/Blog.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We want to wrap object.textColor?.something inside getSafeColor()
  // Pattern: (\\w+)\\.textColor\\?\\.(desktop|tablet|mobile)
  // But wait, the existing code says: heading.textColor?.desktop === 'inherit' ? undefined : heading.textColor?.desktop
  // If we just replace `heading.textColor?.desktop` with `getSafeColor(...)` it will be:
  // getSafeColor(...) === 'inherit' ? undefined : getSafeColor(...)
  
  content = content.replace(/(\w+\.textColor\?\.(?:desktop|tablet|mobile))/g, 'getSafeColor($1)');

  // Also some might use color directly: e.g. heading.color
  // content = content.replace(/(\w+\.color\?\.(?:desktop|tablet|mobile))/g, 'getSafeColor($1)');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated props in ${file}`);
  }
});
