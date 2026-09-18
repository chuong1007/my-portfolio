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

  // Replace text-zinc-100 if any remaining
  content = content.replace(/text-zinc-100\b/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-zinc-200\b/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-zinc-300\b/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-zinc-400\b/g, 'text-[var(--text-muted)]');

  // For About.tsx and Contact.tsx inline colors
  // Replace: getResponsiveValue(heading.textColor, 'desktop')
  // With a logic that handles #FFFFFF:
  
  // Actually, instead of replacing every instance, let's inject a helper at the top if it doesn't exist
  if (!content.includes('const getSafeColor')) {
    const helper = `
const getSafeColor = (color?: string | null) => {
  if (!color || color === 'inherit') return undefined;
  const upper = color.toUpperCase();
  if (upper === '#FFFFFF' || upper === '#FFF' || upper === 'RGB(255, 255, 255)') {
    return 'var(--text-primary)';
  }
  return color;
};
`;
    // Inject after the last import
    const importMatch = content.match(/import.*?(?:\n|;)\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + helper);
    }
  }

  // Now replace all `.textColor?.desktop` with `getSafeColor(.textColor?.desktop)`
  // E.g. `heading.textColor?.desktop === 'inherit' ? undefined : heading.textColor?.desktop`
  // We can just replace `heading.textColor?.desktop` (when used as value) with `getSafeColor(heading.textColor?.desktop)`
  // But regex might be brittle. Let's just fix the `dangerouslySetInnerHTML` to strip inline #ffffff.
  
  if (!content.includes('const cleanHtmlColors')) {
    const htmlHelper = `
const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  return html.replace(/color:\\s*(?:#ffffff|#fff|rgb\\(255,\\s*255,\\s*255\\))/gi, 'color: var(--text-primary)');
};
`;
    const importMatch = content.match(/import.*?(?:\n|;)\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + htmlHelper);
    }
  }
  
  // Replace __html: something
  // with __html: cleanHtmlColors(something)
  // Be careful not to double wrap
  content = content.replace(/__html:\s*(?!cleanHtmlColors\()(.*?)\s*(?:})?}/g, (match, p1) => {
    // If it ends with }, we need to keep it
    const isClosed = match.endsWith('}}');
    return `__html: cleanHtmlColors(${p1})${isClosed ? ' }' : ''}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
