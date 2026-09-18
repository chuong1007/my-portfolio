const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update the scrollFilter to delay the blur
content = content.replace(
  /const scrollFilter = useTransform\(scrollYProgress, \[0, 0\.8\], \["blur\(0px\)", "blur\(12px\)"\]\);/,
  'const scrollFilter = useTransform(scrollYProgress, [0, 0.4, 0.8], ["blur(0px)", "blur(0px)", "blur(12px)"]);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed blur timing');
