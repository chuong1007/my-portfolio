const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldAnimate = `            animate={{
              opacity: [
                0, 0,           
                1, 1,           
                0, 1,           
                0, 1,           
                0, 0,           
              ],
            }}`;

const newAnimate = `            animate={{
              opacity: [
                0, 0,           // 0 -> typeStart (hidden)
                1, 1,           // typeStart -> typeDone (solid)
                0, 1,           // blink 1
                0, 0,           // blink 2 -> disappear
              ],
            }}`;

content = content.replace(oldAnimate, newAnimate);

const oldTransition = `            transition={{
              duration: cursorEnd,
              ease: 'linear',
              times: [
                0,
                (typeStart - 0.01) / cursorEnd,
                typeStart / cursorEnd,
                (typeStart + typeDur) / cursorEnd,
                (typeStart + typeDur + blinkInterval * 1) / cursorEnd,
                (typeStart + typeDur + blinkInterval * 2) / cursorEnd,
                (typeStart + typeDur + blinkInterval * 3) / cursorEnd,
                (typeStart + typeDur + blinkInterval * 4) / cursorEnd,
                (typeStart + typeDur + blinkInterval * 5) / cursorEnd,
                1,
              ],
            }}`;

const newTransition = `            transition={{
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
            }}`;

content = content.replace(oldTransition, newTransition);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed arrays');
