const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix inline padding in About.tsx
content = content.replace(
  /paddingTop: \`\$\{getResponsiveValue\(paddingTopData, globalPreviewMode \?\? 'desktop'\) \|\| 0\}px\`,/,
  "paddingTop: isEditor ? `${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px` : undefined,"
);

content = content.replace(
  /paddingBottom: isExpanded\n\s*\? \`\$\{getResponsiveValue\(paddingBottomData, globalPreviewMode \?\? 'desktop'\) \|\| 80\}px\`\n\s*: '0px',/,
  "paddingBottom: isEditor ? (isExpanded ? `${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 80}px` : '0px') : undefined,"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed About inline padding');
