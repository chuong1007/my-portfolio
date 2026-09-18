const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the Dashboard link
content = content.replace(
  /<Link href="\/admin" className=\{`text-sm transition-colors \$\{pathname === '\/admin' && !tab \? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'\}`\}>Dashboard<\/Link>/,
  ""
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed Dashboard link');
