
"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroAnimatedTitle({ html, className, style }: { html: string, className?: string, style?: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  let text = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  text = text.replace(/&nbsp;/g, ' ');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  useEffect(() => {
    if (mounted && lines.length === 3) {
      const numLetters = lines[0].replace(' ', '').length;
      const line0Done = (numLetters - 1) * 0.08 + 0.4;
      const highlightDone = line0Done + 0.6;
      const typeStart = highlightDone + 0.2;
      const typeDur = lines[2].split('').length * 0.05;
      const wipeOutStart = typeStart + typeDur + 1.0;
      const totalDur = wipeOutStart + 0.6;

      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('typographyFinished'));
      }, totalDur * 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, html]);

  if (!mounted || lines.length !== 3) {
    return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // ─── TIMELINE ────────────────────────────────────────────────
  // Line 0: "Visual"
  const letterStagger   = 0.08;
  const letterDuration  = 0.4;
  const numLetters      = lines[0].replace(' ', '').length;
  // Visual finishes at:
  const line0Done       = (numLetters - 1) * letterStagger + letterDuration; // ~ 5*0.08 + 0.4 = 0.8s

  // Line 1: Highlight
  // Appear IMMEDIATELY after Visual is done
  const highlightStart  = line0Done;          // 0.8s
  const highlightSweep  = 0.6;                // sweep in duration
  const highlightDone   = highlightStart + highlightSweep; // 1.4s

  // Line 2: Typewriter
  const typeStart       = highlightDone + 0.2; // 1.6s
  const typeCharDur     = 0.05;
  const typeChars       = lines[2].split('');
  const typeDur         = typeChars.length * typeCharDur; // ~1.25s (if 25 chars)

  // Cursor
  const blinkInterval   = 0.5;
  const blinkCycles     = 3;
  const blinkDur        = blinkCycles * 2 * blinkInterval; // 3.0s
  const cursorEnd       = typeStart + typeDur + blinkInterval * 2 + 0.6; // Matches wipeOutStart + wipeOutDur  // 1.6 + 1.25 + 3.0 = 5.85s

  // Wipe Out (Base text reveals, Mask disappears)
  // User request: "ngay khi con trỏ type nhấp nháy đến lần thứ 2 thì ô màu vàng mất dần và chữ trắng đổi dần"
  const wipeOutStart    = typeStart + typeDur + blinkInterval * 2;
  const wipeOutDur      = 0.6;
  const totalDur        = wipeOutStart + wipeOutDur; // 6.45s

  const T = totalDur;

  return (
    <div className={className} style={style}>

      {/* ── LINE 0: "Visual" ── */}
      <div className="flex justify-center font-black tracking-tight" style={{ overflow: 'visible' }}>
        {lines[0].split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, y: '50%', opacity: 0 }}
            animate={{ 
              scale: [0, 1.4, 1], 
              y: ['50%', '-10%', '0%'], 
              opacity: [0, 1, 1] 
            }}
            transition={{
              duration: letterDuration,
              delay: i * letterStagger,
              ease: "easeOut",
              times: [0, 0.6, 1]
            }}
            style={{ display: 'inline-block', transformOrigin: 'center bottom' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>

      {/* ── LINE 1: "Graphic Designer" ── */}
      <div className="w-full flex justify-center"><div className="relative inline-flex justify-center items-center font-black tracking-tight px-[0.12em]">
        {/* Invisible monospace text to dictate the true width of the container so monospace text doesn't get clipped */}
        <span className="opacity-0 whitespace-nowrap pointer-events-none" >
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
            className="text-[#09090b] absolute inset-0 flex items-center justify-center whitespace-nowrap"
            style={{ top: '-0.1em', bottom: '0.06em' }}
          >
            {lines[1]}
          </span>
        </motion.div>
      </div>

      </div>
      {/* ── LINE 2: "based in..." ── */}
      <div className="flex justify-center items-center font-light" style={{ minHeight: '1.4em' }}>
        <span style={{ display: 'inline-block', position: 'relative' }}>
          {typeChars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ display: 'none' }}
              animate={{ display: 'inline' }}
              transition={{ delay: typeStart + i * typeCharDur }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}

          {/* Cursor */}
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
          />
        </span>
      </div>

    </div>
  );
}
