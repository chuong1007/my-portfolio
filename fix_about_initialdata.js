const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /const initialData = \{\n\s*\.\.\.contentData,\n\s*isVisible,\n\s*paddingTop: paddingTopData,\n\s*paddingBottom: paddingBottomData\n\s*\};/,
  `const initialData = {
    ...contentData,
    isVisible,
    paddingTop: paddingTopData,
    paddingBottom: paddingBottomData,
    avatarUrl,
    expandedBlocks
  };`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed initialData in About.tsx');
