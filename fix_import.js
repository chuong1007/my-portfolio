const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/AdminModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('ExternalLink,')) {
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+"lucide-react";/, (match, p1) => {
    return 'import { ' + p1 + ', ExternalLink } from "lucide-react";';
  });
  fs.writeFileSync(filePath, content, 'utf8');
}
