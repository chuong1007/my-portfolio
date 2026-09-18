const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add @container to the flex-1 div
content = content.replace(
  /<div className="flex-1 space-y-4">/,
  '<div className="flex-1 space-y-4 @container">'
);

// Update style block for about-subheading to use clamp with cqi
content = content.replace(
  /font-size: var\(--fs-sub-mob\);/,
  'font-size: clamp(12px, 6cqi, var(--fs-sub-mob));\n          white-space: nowrap;\n          overflow: hidden;\n          text-overflow: ellipsis;'
);
content = content.replace(
  /font-size: var\(--fs-sub-tab\);/,
  'font-size: clamp(14px, 4cqi, var(--fs-sub-tab));\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;'
);
content = content.replace(
  /font-size: var\(--fs-sub-desk\);/,
  'font-size: clamp(14px, 3.5cqi, var(--fs-sub-desk));\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;'
);

// Update inline styles for isEditor
content = content.replace(
  /fontSize: \`\$\{getResponsiveValue\(subheading\.fontSize, globalPreviewMode \|\| 'desktop'\) \|\| 18\}px\`/,
  "fontSize: `clamp(14px, ${globalPreviewMode === 'mobile' ? '6cqi' : globalPreviewMode === 'tablet' ? '4cqi' : '3.5cqi'}, ${getResponsiveValue(subheading.fontSize, globalPreviewMode || 'desktop') || 18}px)`"
);

// We need to also add whitespace-nowrap to the className
content = content.replace(
  /className=\{cn\("about-subheading text-\[var\(--text-muted\)\] whitespace-pre-wrap/,
  'className={cn("about-subheading text-[var(--text-muted)] whitespace-nowrap"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed About subheading');
