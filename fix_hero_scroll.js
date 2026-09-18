const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
if (!content.includes('useScroll')) {
  content = content.replace(
    /import \{ motion \} from "framer-motion";/,
    'import { motion, useScroll, useTransform } from "framer-motion";'
  );
}
if (!content.includes('useRef')) {
  content = content.replace(
    /import \{ useState, useEffect, useCallback \} from "react";/,
    'import { useState, useEffect, useCallback, useRef } from "react";'
  );
}

// 2. Add refs and hooks inside the component
if (!content.includes('const heroRef = useRef<HTMLElement>(null);')) {
  content = content.replace(
    /const \{ isAdmin, isEditMode, globalPreviewMode \} = useAdmin\(\);/,
    `const { isAdmin, isEditMode, globalPreviewMode } = useAdmin();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);`
  );
}

// 3. Attach ref to section
content = content.replace(
  /<section id="hero"/,
  '<section id="hero" ref={heroRef}'
);

// 4. Wrap the title in a motion.div that uses the scroll values
// We already have: <div className="flex flex-col items-center w-full">
content = content.replace(
  /<div className="flex flex-col items-center w-full">/,
  '<motion.div className="flex flex-col items-center w-full" style={{ scale: scrollScale, opacity: scrollOpacity }}>'
);
content = content.replace(
  /<\/motion.h1>\n\s*<\/div>/,
  '</motion.h1>\n        </motion.div>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Hero scroll animation');
