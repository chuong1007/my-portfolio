const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The tags block is:
// <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10 overflow-hidden">
content = content.replace(
  /<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10 overflow-hidden">/,
  '<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-10 mb-10 overflow-hidden">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added mt-10 to tags block');
