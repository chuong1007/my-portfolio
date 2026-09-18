const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Contact.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /        style=\{\{\n          "--pt-desk": `\$\{getResponsiveValue\(paddingTopData, 'desktop'\) \|\| 0\}px`,\n          "--pt-tab": `\$\{getResponsiveValue\(paddingTopData, 'tablet'\) \|\| 0\}px`,\n          "--pt-mob": `\$\{getResponsiveValue\(paddingTopData, 'mobile'\) \|\| 0\}px`,\n          "--pb-desk": `\$\{getResponsiveValue\(paddingBottomData, 'desktop'\) \|\| 0\}px`,\n          "--pb-tab": `\$\{getResponsiveValue\(paddingBottomData, 'tablet'\) \|\| 0\}px`,\n          "--pb-mob": `\$\{getResponsiveValue\(paddingBottomData, 'mobile'\) \|\| 0\}px`\n        \} as any\}/,
  `        style={{
          "--pt-desk": \`\${getResponsiveValue(paddingTopData, 'desktop') || 0}px\`,
          "--pt-tab": \`\${getResponsiveValue(paddingTopData, 'tablet') || 0}px\`,
          "--pt-mob": \`\${getResponsiveValue(paddingTopData, 'mobile') || 0}px\`,
          "--pb-desk": \`\${getResponsiveValue(paddingBottomData, 'desktop') || 0}px\`,
          "--pb-tab": \`\${getResponsiveValue(paddingBottomData, 'tablet') || 0}px\`,
          "--pb-mob": \`\${getResponsiveValue(paddingBottomData, 'mobile') || 0}px\`,
          ...(isEditor ? {
             paddingTop: \`\${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px\`,
             paddingBottom: \`\${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 0}px\`
          } : {})
        } as any}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed padding logic for Contact.tsx');
