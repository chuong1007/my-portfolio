const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/GlobalPreviewWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Change isBuilder to isAdminPage to hide Contact on ALL admin routes
content = content.replace(
  /const isBuilder = pathname === "\/admin\/builder";/g,
  'const isBuilder = pathname === "/admin/builder";\n  const isAdminPage = pathname.startsWith("/admin");'
);

content = content.replace(
  /\{!isBuilder && <Contact \/>\}/g,
  '{!isAdminPage && <Contact />}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Contact section visibility in Admin!');
