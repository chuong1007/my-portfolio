const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('if (d.data && d.data.expandedBlocks) {');
const endIndex = content.indexOf('setIsVisible(d.isVisible !== false);');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `if (d.data && d.data.expandedBlocks) {
        setExpandedBlocks(d.data.expandedBlocks);
      } else {
        setExpandedBlocks([]);
      }
      `;
  const toRemove = content.substring(startIndex, endIndex);
  content = content.replace(toRemove, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed admin/about/page.tsx');
}
