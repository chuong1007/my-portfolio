const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /const scrollOpacity = useTransform\(scrollYProgress, \[0, 0\.8\], \[1, 0\]\);/,
  'const scrollOpacity = useTransform(scrollYProgress, [0, 0.3, 0.9], [1, 1, 0]);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed opacity timing');
