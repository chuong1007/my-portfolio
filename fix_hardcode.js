const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('/admin') && !file.includes('/builder')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') && !file.includes('/admin/') && !file.includes('/builder/')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace common hardcoded classes for Light/Dark mode compatibility
  // Note: We avoid replacing hover:bg-white/10 or similar alpha values as they are for overlays.
  
  content = content.replace(/bg-zinc-950/g, 'bg-[var(--bg-base)]');
  content = content.replace(/bg-zinc-900(?!\/)/g, 'bg-[var(--bg-surface)]');
  content = content.replace(/border-zinc-800(?!\/)/g, 'border-[var(--border-default)]');
  content = content.replace(/border-zinc-900(?!\/)/g, 'border-[var(--border-subtle)]');
  
  content = content.replace(/text-zinc-400/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-zinc-500/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-zinc-300/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-zinc-200/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-zinc-50\b/g, 'text-[var(--text-primary)]');
  
  // Specific case for text-white unless it's in a button that we know should be white
  // Let's replace text-white only if it's not a primary button. 
  // It's safer to use a regex that handles generic text-white
  content = content.replace(/\btext-white\b/g, 'text-[var(--text-primary)]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
