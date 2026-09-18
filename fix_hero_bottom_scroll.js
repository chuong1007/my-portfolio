const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the start of the hero-scroll motion.div
content = content.replace(
  /<motion\.div\n\s*initial=\{\{ opacity: 0 \}\}\n\s*animate=\{\{ opacity: 1 \}\}\n\s*transition=\{\{ delay: 4\.5, duration: 1 \}\}\n\s*className=\{cn\("hero-scroll"/,
  `<motion.div style={{ scale: scrollScale, opacity: scrollOpacity, filter: scrollFilter }}>\n        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 4.5, duration: 1 }}
  className={cn("hero-scroll"`
);

// We also need to add the closing </motion.div> for the new wrapper
// The hero-scroll div ends right before </section>
content = content.replace(
  /<\/motion\.div>\n\s*<\/section>/,
  '</motion.div>\n        </motion.div>\n      </section>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added scroll effect to bottom scroll indicator');
