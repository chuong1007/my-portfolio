const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the entire logo block inside the admin layout header
content = content.replace(
  /<a\s+href="\/"\s+className="flex items-center gap-2 group"[\s\S]*?<\/a>/,
  `{/* Logo Removed as per user request */}`
);

// We should also make the ADMIN span bigger since it's the only thing left
content = content.replace(
  /<span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg font-medium">\s*ADMIN\s*<\/span>/,
  `<span className="text-xl font-black text-white bg-zinc-800 px-3 py-1 rounded-lg tracking-widest">\n              ADMIN\n            </span>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed admin logo!');
