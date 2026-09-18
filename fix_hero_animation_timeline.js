const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the highlight mask animation with clip-path wipe effect
content = content.replace(
  /initial=\{\{ width: "0%", opacity: 1 \}\}[\s\S]*?opacity: \{ delay: fadeOutTime, duration: 0\.4, ease: "linear" \}\n\s*\}\}/,
  `initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ 
            clipPath: [
              "inset(0% 100% 0% 0%)", // 0s: Hidden
              "inset(0% 100% 0% 0%)", // Wait until highlightStartDelay
              "inset(0% 0% 0% 0%)",   // Reveal left to right
              "inset(0% 0% 0% 0%)",   // Stay visible
              "inset(0% 0% 0% 100%)"  // Hide left to right
            ]
          }}
          transition={{ 
            duration: fadeOutTime + 0.6,
            times: [
              0,
              highlightStartDelay / (fadeOutTime + 0.6),
              (highlightStartDelay + highlightDuration) / (fadeOutTime + 0.6),
              fadeOutTime / (fadeOutTime + 0.6),
              1
            ],
            ease: "easeInOut"
          }}`
);

// We need to also remove `width: "100%"` from the highlight mask since we are using clip-path, it should naturally take full width via inset-0
content = content.replace(
  /className="absolute top-\[0\.1em\] bottom-\[-0\.05em\] left-0 overflow-hidden whitespace-nowrap bg-yellow-400 z-10"/g,
  'className="absolute top-[0.1em] bottom-[-0.05em] left-0 right-0 overflow-hidden whitespace-nowrap bg-yellow-400 z-10"'
);

// Replace cursor animation to fix early appearance
content = content.replace(
  /initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: \[1, 1, 0, 1, 0, 1, 0, 0\] \}\}\s*transition=\{\{[\s\S]*?\}\}/,
  `initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0, 1, 0, 1, 0, 0] }}
            transition={{ 
              duration: totalCursorAnimDuration + typeStartDelay,
              times: [
                0,
                (typeStartDelay - 0.01) / (totalCursorAnimDuration + typeStartDelay), // 1.79s: Hidden
                typeStartDelay / (totalCursorAnimDuration + typeStartDelay), // 1.8s: Solid
                (typeStartDelay + typeDuration) / (totalCursorAnimDuration + typeStartDelay), // 3.8s: Solid
                (typeStartDelay + typeDuration + 0.4) / (totalCursorAnimDuration + typeStartDelay), // 4.2s: Off
                (typeStartDelay + typeDuration + 0.8) / (totalCursorAnimDuration + typeStartDelay), // 4.6s: On
                (typeStartDelay + typeDuration + 1.2) / (totalCursorAnimDuration + typeStartDelay), // 5.0s: Off
                (typeStartDelay + typeDuration + 1.6) / (totalCursorAnimDuration + typeStartDelay), // 5.4s: On
                (typeStartDelay + typeDuration + 2.0) / (totalCursorAnimDuration + typeStartDelay), // 5.8s: Off
                1 // 6.2s: Final Off
              ],
              ease: "linear"
            }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed timeline!');
