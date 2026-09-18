const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Increase typeStartDelay to 2.5s
content = content.replace(
  /const typeStartDelay = 1\.8;/g,
  'const typeStartDelay = 2.5;'
);

// We must also update totalCursorAnimDuration and fadeOutTime
// Blinking cursor ends at 6.5s (2.5 + 4.0 = 6.5)
content = content.replace(
  /const fadeOutTime = 5\.8;/g,
  'const fadeOutTime = 6.5;'
);

// We need to fix the transition times for the cursor to use the new total duration!
// Wait! If fadeOutTime is 6.5, the cursor transition was hardcoded with `// 1.8 + 4.0 = 5.8s`
content = content.replace(
  /duration: totalCursorAnimDuration \+ 1\.8/g, // Just in case
  'duration: totalCursorAnimDuration + typeStartDelay'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Increased typeStartDelay to 2.5s!');
