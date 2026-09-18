const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Contact.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to inject the fontSize and lineHeight for isEditor
content = content.replace(
  /style=\{\{\s*"--h-fs-desk"/,
  `style={{
                    fontSize: isEditor ? \`\${heading.fontSize?.[globalPreviewMode || 'desktop'] || 80}px\` : undefined,
                    lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                    fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                    fontWeight: isEditor ? (heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                    "--h-fs-desk"`
);

content = content.replace(
  /style=\{\{\s*"--s-fs-desk"/,
  `style={{
                    fontSize: isEditor ? \`\${subtitle.fontSize?.[globalPreviewMode || 'desktop'] || 24}px\` : undefined,
                    lineHeight: isEditor ? (subtitle.lineHeight?.[globalPreviewMode || 'desktop'] || '1.4') : undefined,
                    "--s-fs-desk"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Contact styles');
