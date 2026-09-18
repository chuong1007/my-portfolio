const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('if (!d.data?.expandedBlocks || d.data.expandedBlocks.length < 4) {');
if (startIndex !== -1) {
  const endIndex = content.indexOf('setIsVisible(d.isVisible !== false);', startIndex);
  if (endIndex !== -1) {
    const replacement = `if (d.data?.expandedBlocks) {
        setExpandedBlocks(d.data.expandedBlocks);
      } else {
        setExpandedBlocks([]);
      }
      `;
    const toRemove = content.substring(startIndex, endIndex);
    content = content.replace(toRemove, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully replaced fallback in admin/about/page.tsx');
  }
}
