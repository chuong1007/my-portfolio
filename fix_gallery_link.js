const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Gallery.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /href="\/admin\?tab=projects"/,
  'href="/admin/projects"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Gallery link');
