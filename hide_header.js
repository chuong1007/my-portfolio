const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/GlobalPreviewWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Hide Header on Admin Pages
content = content.replace(
  /\{!isPreviewActive && <Header \/>\}/g,
  '{!isPreviewActive && !isAdminPage && <Header />}'
);

content = content.replace(
  /              <Header \/>\n              <main className="min-h-full">/g,
  `              {!isAdminPage && <Header />}
              <main className="min-h-full">`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Hid global header on admin pages');
