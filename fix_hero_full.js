const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/HeroAnimatedTitle.tsx');

const content = `"use client";
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
  
  // Blinking cursor ends at 5.8s
  const totalCursorAnimDuration = 4.0; // 1.8s to 5.8s
  
  // At 5.8s, the highlight fades out
  const fadeOutTime = 5.8;

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
      <div className="relative inline-block font-bold px-[0.15em]">
        {/* Base text: Instantly visible at fadeOutTime */}
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: fadeOutTime, duration: 0 }}
          className="relative z-0"
        >
          {lines[1]}
        </motion.span>

        {/* Highlight mask */}
        <motion.div 
          className="absolute top-[0.1em] bottom-[-0.05em] left-0 right-0 overflow-hidden whitespace-nowrap bg-yellow-400 z-10"
          initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ 
            clipPath: [
              "inset(0% 100% 0% 0%)",
              "inset(0% 100% 0% 0%)",
              "inset(0% 0% 0% 0%)",
              "inset(0% 0% 0% 0%)",
              "inset(0% 0% 0% 100%)"
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
          }}
        >
          {/* Black text inside yellow highlight */}
          <span className="text-[#09090b] absolute inset-0 flex items-center justify-center -mt-[0.05em]">
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
            animate={{ opacity: [0, 0, 1, 1, 0, 1, 0, 1, 0, 0] }}
            transition={{ 
              duration: totalCursorAnimDuration + typeStartDelay,
              times: [
                0,
                (typeStartDelay - 0.01) / (totalCursorAnimDuration + typeStartDelay),
                typeStartDelay / (totalCursorAnimDuration + typeStartDelay),
                (typeStartDelay + typeDuration) / (totalCursorAnimDuration + typeStartDelay),
                (typeStartDelay + typeDuration + 0.4) / (totalCursorAnimDuration + typeStartDelay),
                (typeStartDelay + typeDuration + 0.8) / (totalCursorAnimDuration + typeStartDelay),
                (typeStartDelay + typeDuration + 1.2) / (totalCursorAnimDuration + typeStartDelay),
                (typeStartDelay + typeDuration + 1.6) / (totalCursorAnimDuration + typeStartDelay),
                1,
                1
              ],
              ease: "linear"
            }}
            className="inline-block w-[0.08em] h-[0.9em] bg-current ml-[0.05em] align-baseline"
          />
        </span>
      </div>

    </div>
  );
}
`;
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully recreated HeroAnimatedTitle.tsx with correct syntax.');
