const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to insert useScroll and useTransform back.
// Find: const fetchContent = useCallback
const hookInsertionPoint = content.indexOf('const fetchContent = useCallback');
if (hookInsertionPoint !== -1) {
  const hooks = `
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.3, 0.9], [1, 1, 0]);
  const scrollFilter = useTransform(scrollYProgress, [0, 0.3, 0.8], ["blur(0px)", "blur(0px)", "blur(12px)"]);

  `;
  content = content.substring(0, hookInsertionPoint) + hooks + content.substring(hookInsertionPoint);
}

// Now wrap the content in motion.div again
// First block: <motion.h1 ...
content = content.replace(
  /<motion\.h1/g,
  '<motion.div className="flex flex-col items-center w-full" style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}>\n            <motion.h1'
);
// End of first block: </motion.h1>
content = content.replace(
  /<\/motion\.h1>/g,
  '</motion.h1>\n        </motion.div>'
);

// Second block: <motion.div initial={{ opacity: 0 }} ... className={cn("hero-scroll"
content = content.replace(
  /<motion\.div\s+initial=\{\{\s*opacity:\s*0\s*\}\}\s+animate=\{\{\s*opacity:\s*1\s*\}\}\s+transition=\{\{\s*delay:\s*4\.5,\s*duration:\s*1\s*\}\}\s+className=\{cn\("hero-scroll"/g,
  '<motion.div style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}>\n        <motion.div\n  initial={{ opacity: 0 }}\n  animate={{ opacity: 1 }}\n  transition={{ delay: 4.5, duration: 1 }}\n  className={cn("hero-scroll"'
);

// End of second block: </motion.div> just before </section>
content = content.replace(
  /<\/motion\.div>\s*<\/section>/g,
  '</motion.div>\n        </motion.div>\n      </section>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored scroll animations in Hero');
