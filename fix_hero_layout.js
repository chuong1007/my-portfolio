const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const line1Regex = /\{\/\* ── LINE 1: "Graphic Designer" ── \*\/\}\s*<div className="relative inline-block font-bold px-\[0\.12em\]">[\s\S]*?\{\/\* ── LINE 2: "based in\.\.\." ── \*\/\}/;

const newLine1 = `{/* ── LINE 1: "Graphic Designer" ── */}
      <div className="relative flex justify-center items-center font-bold px-[0.12em]">
        {/* Invisible monospace text to dictate the true width of the container so monospace text doesn't get clipped */}
        <span className="opacity-0 font-mono whitespace-nowrap pointer-events-none">
          {lines[1]}
        </span>

        {/* Base text: White text (Original Font) */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center z-0 whitespace-nowrap"
          initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
          animate={{
            clipPath: [
              'inset(0% 100% 0% 0%)', 
              'inset(0% 100% 0% 0%)',
              'inset(0% 0% 0% 0%)',   
            ],
          }}
          transition={{
            duration: T,
            times: [0, wipeOutStart / T, 1],
            ease: ['linear', 'easeInOut'],
          }}
        >
          {lines[1]}
        </motion.span>

        {/* Yellow mask: Black text */}
        <motion.div
          className="absolute top-[0.1em] bottom-[-0.06em] left-0 right-0 overflow-hidden bg-yellow-400 z-10"
          initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
          animate={{
            clipPath: [
              'inset(0% 100% 0% 0%)',  
              'inset(0% 100% 0% 0%)',  
              'inset(0% 0%   0% 0%)',  
              'inset(0% 0%   0% 0%)',  
              'inset(0% 0%   0% 100%)',
            ],
          }}
          transition={{
            duration: T,
            times: [
              0,
              highlightStart / T,
              highlightDone  / T,
              wipeOutStart   / T,
              1,
            ],
            ease: ['linear', 'easeInOut', 'linear', 'easeInOut'],
          }}
        >
          <span
            className="text-[#09090b] absolute inset-0 flex items-center justify-center font-mono whitespace-nowrap"
            style={{ top: '-0.1em', bottom: '0.06em' }}
          >
            {lines[1]}
          </span>
        </motion.div>
      </div>

      {/* ── LINE 2: "based in..." ── */}`;

content = content.replace(line1Regex, newLine1);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed hero layout width');
