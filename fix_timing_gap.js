const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The 3rd blink finishes at typeStartDelay + typeDuration + 2.0 (which is 1.8 + 2.0 + 2.0 = 5.8s).
// We should make the cursor animation end at 5.8s instead of 6.2s, so fadeOutTime becomes 5.8s!
content = content.replace(
  /const cursorBlinkDuration = 2\.4;/g,
  'const cursorBlinkDuration = 2.0;'
);

// We need to update the cursor transition times to match totalCursorAnimDuration = 4.0s
content = content.replace(
  /transition=\{\{[\s\S]*?ease: "linear"\n\s*\}\}/,
  `transition={{ 
              duration: totalCursorAnimDuration + typeStartDelay, // 1.8 + 4.0 = 5.8s
              times: [
                0,
                (typeStartDelay - 0.01) / (totalCursorAnimDuration + typeStartDelay), // 1.79s
                typeStartDelay / (totalCursorAnimDuration + typeStartDelay), // 1.8s
                (typeStartDelay + typeDuration) / (totalCursorAnimDuration + typeStartDelay), // 3.8s
                (typeStartDelay + typeDuration + 0.4) / (totalCursorAnimDuration + typeStartDelay), // 4.2s
                (typeStartDelay + typeDuration + 0.8) / (totalCursorAnimDuration + typeStartDelay), // 4.6s
                (typeStartDelay + typeDuration + 1.2) / (totalCursorAnimDuration + typeStartDelay), // 5.0s
                (typeStartDelay + typeDuration + 1.6) / (totalCursorAnimDuration + typeStartDelay), // 5.4s
                1, // 5.8s: Off
                1 // 5.8s: Off
              ],
              ease: "linear"
            }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed timing gap!');
