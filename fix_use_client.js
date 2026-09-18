const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the import from the top if it's there
content = content.replace(/^import Link from "next\/link";\n/, '');

// Find where "use client"; is
if (content.includes('"use client";')) {
    // Insert import Link right after "use client";
    content = content.replace(/"use client";\n/, '"use client";\nimport Link from "next/link";\n');
} else {
    // Just in case it wasn't there
    content = 'import Link from "next/link";\n' + content;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed use client order');
