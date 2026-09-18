const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Contact.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /const \{ isAdmin, globalPreviewMode \} = useAdmin\(\);/,
  `const { isAdmin, globalPreviewMode } = useAdmin();\n  const isEditor = isAdmin;`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done isEditor in Contact.tsx');
