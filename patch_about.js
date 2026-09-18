const fs = require('fs');
const file = 'src/components/sections/About.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'paddingTop: isEditor ? `${getResponsiveValue(paddingTopData, globalPreviewMode || \'desktop\') || 0}px` : undefined,',
  `paddingTop: isEditor ? (Number(getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0) >= 0 ? \`\${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px\` : '0px') : undefined,
          marginTop: isEditor ? (Number(getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0) < 0 ? \`\${getResponsiveValue(paddingTopData, globalPreviewMode || 'desktop') || 0}px\` : '0px') : undefined,`
);

code = code.replace(
  'paddingBottom: isEditor ? (isExpanded ? `${getResponsiveValue(paddingBottomData, globalPreviewMode || \'desktop\') || 80}px` : \'0px\') : undefined,',
  `paddingBottom: isEditor ? (Number(getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)) >= 0 ? \`\${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || (isExpanded ? 80 : 0)}px\` : '0px') : undefined,
          marginBottom: isEditor ? (Number(getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop') || 0) < 0 ? \`\${getResponsiveValue(paddingBottomData, globalPreviewMode || 'desktop')}px\` : '0px') : undefined,`
);

fs.writeFileSync(file, code);
