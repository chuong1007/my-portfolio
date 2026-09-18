const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');

const newContent = `"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroAnimatedTitle({ html, className, style }: { html: string, className?: string, style?: any }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  let text = html
    .replace(/<\\/p>/gi, '\\n')
    .replace(/<br\\s*\\/?>/gi, '\\n')
    .replace(/<[^>]+>/g, '') 
    .trim();
  
  text = text.replace(/&nbsp;/g, ' ');
  const lines = text.split('\\n').map(l => l.trim()).filter(l => l);

  if (!mounted || lines.length !== 3) {
    return (
      <div 
        className={className} 
        style={style} 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  }

  const wordPopDelay = 0.0;
  
  // Highlight sweeps from 0.8s to 1.6s
  const highlightStartDelay = 0.8;
  const highlightDuration = 0.8;
  
  // Typing starts at 1.8s
  const typeStartDelay = 1.8;
  const typeCharDuration = 0.08;
  const typeChars = lines[2].split('');
  const typeDuration = typeChars.length * typeCharDuration; // ~2.0s if 25 chars
  
  // Blinking cursor
  // Starts solid at 1.8s, stays solid until typing finishes (1.8s + 2.0s = 3.8s)
  // Then blinks 3 times (each cycle 0.8s) -> 2.4s. Ends at 6.2s.
  const cursorBlinkDuration = 2.4; 
  const totalCursorAnimDuration = typeDuration + cursorBlinkDuration;
  
  // At 6.2s, the highlight fades out
  const fadeOutTime = typeStartDelay + totalCursorAnimDuration;

  const words = lines[0].split(' ');

  return (
    <div className={className} style={style}>
      
      {/* Line 0: Pop up words, bold */}
      <div className="flex flex-wrap justify-center gap-[0.25em] overflow-hidden font-bold">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: wordPopDelay + i * 0.1, 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Line 1: Yellow Highlight Reveal, bold */}
      <div className="relative inline-block font-bold">
        {/* Base text: Hidden initially, becomes visible at fadeOutTime */}
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: fadeOutTime, duration: 0.4 }}
          className="relative z-0"
        >
          {lines[1]}
        </motion.span>

        {/* Highlight mask */}
        <motion.div 
          className="absolute inset-0 overflow-hidden whitespace-nowrap bg-yellow-400 z-10"
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", opacity: 0 }}
          transition={{ 
            width: { delay: highlightStartDelay, duration: highlightDuration, ease: "easeInOut" },
            opacity: { delay: fadeOutTime, duration: 0.4, ease: "linear" }
          }}
        >
          {/* Black text inside yellow highlight */}
          <span className="text-[#09090b] absolute left-0 top-0 h-full flex items-center">
            {lines[1]}
          </span>
        </motion.div>
      </div>

      {/* Line 2: Typewriter with blinking cursor, thin font */}
      <div className="flex justify-center items-center h-[1.2em] font-light">
        <span className="inline-block relative">
          {typeChars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ display: "none" }}
              animate={{ display: "inline" }}
              transition={{ delay: typeStartDelay + i * typeCharDuration }}
            >
              {char === ' ' ? '\\u00A0' : char}
            </motion.span>
          ))}
          
          {/* Blinking Cursor */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 1, 0, 1, 0, 1, 0, 0] }}
            transition={{ 
              delay: typeStartDelay, 
              duration: totalCursorAnimDuration,
              times: [
                0, // 1.8s absolute: Solid
                typeDuration / totalCursorAnimDuration, // 3.8s: End of typing, stay solid
                (typeDuration + 0.4) / totalCursorAnimDuration, // 4.2s: Off
                (typeDuration + 0.8) / totalCursorAnimDuration, // 4.6s: On
                (typeDuration + 1.2) / totalCursorAnimDuration, // 5.0s: Off
                (typeDuration + 1.6) / totalCursorAnimDuration, // 5.4s: On
                (typeDuration + 2.0) / totalCursorAnimDuration, // 5.8s: Off
                1 // 6.2s: Final Off
              ]
            }}
            className="inline-block w-[0.08em] h-[0.9em] bg-current ml-[0.05em] align-baseline"
          />
        </span>
      </div>

    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Fixed HeroAnimatedTitle.tsx timings');
