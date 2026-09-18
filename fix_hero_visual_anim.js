const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update delays
content = content.replace(/const highlightStartDelay = [0-9.]+;/g, 'const highlightStartDelay = 1.5;');
content = content.replace(/const typeStartDelay = [0-9.]+;/g, 'const typeStartDelay = 3.2;');
content = content.replace(/const fadeOutTime = [0-9.]+;/g, 'const fadeOutTime = 7.2;');

// Update Line 0 to split by character and use scale + y animation
content = content.replace(
  /\{\/\* Line 0: Pop up words, bold \*\/\}\n\s*<div className="flex flex-wrap justify-center gap-\[0\.25em\] overflow-hidden font-bold">[\s\S]*?<\/div>/,
  `{/* Line 0: Pop up letters from center, then move up */}
      <motion.div 
        className="flex flex-wrap justify-center font-bold z-20 relative"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 1.0, duration: 0.5, ease: "easeInOut" }}
      >
        {lines[0].split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ 
              delay: i * 0.08, 
              duration: 0.4, 
              ease: "easeOut" 
            }}
            className="inline-block"
          >
            {char === ' ' ? '\\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated Line 0 animation and shifted timeline!');
