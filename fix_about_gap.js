const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /"about-layout flex gap-6 md:gap-8"/,
  '"about-layout flex"'
);

// We need to inject the gap logic alongside the flex-col logic
content = content.replace(
  /isEditor && globalPreviewMode !== 'desktop' \? "flex-col" : "flex-col md:flex-row",/,
  "isEditor && globalPreviewMode !== 'desktop' ? 'flex-col gap-2' : 'flex-col md:flex-row gap-2 md:gap-8',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed About gap');
