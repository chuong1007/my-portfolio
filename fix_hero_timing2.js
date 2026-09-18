const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /const scrollOpacity = useTransform\(scrollYProgress, \[0, 0\.3, 0\.9\], \[1, 1, 0\]\);/,
  'const scrollOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8], [1, 1, 0]);'
);

content = content.replace(
  /const scrollFilter = useTransform\(scrollYProgress, \[0, 0\.4, 0\.8\], \["blur\(0px\)", "blur\(0px\)", "blur\(12px\)"\]\);/,
  'const scrollFilter = useTransform(scrollYProgress, [0, 0.15, 0.7], ["blur(0px)", "blur(0px)", "blur(12px)"]);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed blur timing 2');
