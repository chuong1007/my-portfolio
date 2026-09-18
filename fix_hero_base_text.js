const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Base Text animation
content = content.replace(
  /<motion\.span \n\s*initial=\{\{ opacity: 0 \}\}\n\s*animate=\{\{ opacity: 1 \}\}\n\s*transition=\{\{ delay: fadeOutTime, duration: 0 \}\}/,
  `<motion.span 
          initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ 
            clipPath: [
              "inset(0% 100% 0% 0%)", // 0s: Hidden
              "inset(0% 100% 0% 0%)", // Wait until fadeOutTime
              "inset(0% 0% 0% 0%)"    // Reveal Left to Right!
            ]
          }}
          transition={{ 
            duration: fadeOutTime + 0.6,
            times: [
              0,
              fadeOutTime / (fadeOutTime + 0.6),
              1
            ],
            ease: "easeInOut"
          }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed base text to reveal left-to-right perfectly synced with mask!');
