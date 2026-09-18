const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add scrollFilter hook
if (!content.includes('const scrollFilter = useTransform')) {
  content = content.replace(
    /const scrollOpacity = useTransform\(scrollYProgress, \[0, 0\.8\], \[1, 0\]\);/,
    `const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);\n  const scrollFilter = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(12px)"]);`
  );
}

// 2. Add filter to motion.div style
content = content.replace(
  /style=\{\{ scale: scrollScale, opacity: scrollOpacity \}\}/,
  'style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added blur to Hero');
