const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the framer-motion scroll hooks
content = content.replace(/const \{ scrollYProgress \} = useScroll\(\{[\s\S]*?\}\);\s*const scrollScale = useTransform[^\n]*\n\s*const scrollOpacity = useTransform[^\n]*\n\s*const scrollFilter = useTransform[^\n]*\n/, '');

// Replace style={...} with nothing or just remove the scroll styles
content = content.replace(/style=\{\{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter \}\}/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed scroll animations from Hero');
