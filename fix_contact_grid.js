const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Contact.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /isEditor && globalPreviewMode !== 'desktop' \? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"/,
  "isEditor && globalPreviewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Contact grid');
