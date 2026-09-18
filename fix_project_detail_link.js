const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProjectDetail.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /href=\{`\/admin\?edit=\$\{project\.id\}`\}/,
  'href={`/admin/projects?edit=${project.id}`}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed ProjectDetail link');
