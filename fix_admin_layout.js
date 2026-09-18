const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the span with a Link
content = content.replace(
  /<span className="text-base font-black text-white tracking-widest">ADMIN<\/span>/g,
  `<Link href="/admin" className="text-base font-black text-white tracking-widest hover:text-zinc-300 transition-colors">ADMIN</Link>`
);

// We need to make sure Link is imported if it isn't already
if (!content.includes('import Link from "next/link"')) {
    content = 'import Link from "next/link";\n' + content;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed admin layout');
