const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The scroll to explore section animation:
// transition={{ delay: 0.5, duration: 1 }}
content = content.replace(
  /transition=\{\{ delay: 0\.5, duration: 1 \}\}/,
  'transition={{ delay: 4.5, duration: 1 }}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed scroll delay');
