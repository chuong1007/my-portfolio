const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Wipe Out section
content = content.replace(
  /\/\/ Wipe Out \(Base text reveals, Mask disappears\)[\s\S]*?const wipeOutDur      = 0\.6;/,
  `// Wipe Out (Base text reveals, Mask disappears)
  // User request: "ngay khi con trỏ type nhấp nháy đến lần thứ 2 thì ô màu vàng mất dần và chữ trắng đổi dần"
  const wipeOutStart    = typeStart + typeDur + blinkInterval * 2;
  const wipeOutDur      = 0.6;`
);

// We should also make sure the cursor stops blinking or fades out when it reaches cursorEnd.
// If T becomes smaller than cursorEnd, the cursor animation will be out of sync because its duration is `cursorEnd`.
// Let's set cursorEnd to match T so the cursor disappears when the wipeout finishes!
content = content.replace(
  /const cursorEnd       = typeStart \+ typeDur \+ blinkDur;/,
  `const cursorEnd       = typeStart + typeDur + blinkInterval * 2 + 0.6; // Matches wipeOutStart + wipeOutDur`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed timeline');
