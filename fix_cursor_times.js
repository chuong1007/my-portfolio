const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the cursor animation block
const oldCursorStart = '          {/* Cursor */}';
const oldCursorEnd = '            />';

const startIdx = content.indexOf(oldCursorStart);
let endIdx = content.indexOf(oldCursorEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    endIdx += oldCursorEnd.length;
    
    const newCursor = `          {/* Cursor */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{
              opacity: [
                0, 0,           // 0 -> typeStart (hidden)
                1, 1,           // typeStart -> typeDone (solid)
                0, 1,           // blink 1
                0, 0,           // blink 2 -> disappear
              ],
            }}
            transition={{
              duration: T,
              ease: 'linear',
              times: [
                0,
                (typeStart - 0.01) / T,
                typeStart / T,
                (typeStart + typeDur) / T,
                (typeStart + typeDur + blinkInterval * 1) / T,
                (typeStart + typeDur + blinkInterval * 2) / T,
                1,
              ],
            }}
            style={{
              display: 'inline-block',
              width: '0.08em',
              height: '0.85em',
              background: 'currentColor',
              marginLeft: '0.05em',
              verticalAlign: 'baseline',
            }}
          />`;
          
    content = content.substring(0, startIdx) + newCursor + content.substring(endIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed cursor animation array');
} else {
    console.log('Could not find cursor animation');
}
