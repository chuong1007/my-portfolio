const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace {project.content.substring(0, 100)} with a striped version
// We can use a regex to strip HTML tags from project.content
content = content.replace(
  /\{project\.content\.substring\(0, 100\)\}\.\.\./g,
  '{project.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}...'
);
// Also just in case they used different substring length
content = content.replace(
  /\{project\.content\.substring\(0, 120\)\}\.\.\./g,
  '{project.content.replace(/<[^>]*>?/gm, "").substring(0, 120)}...'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed HTML tags in admin project cards!');
