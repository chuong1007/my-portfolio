
"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroAnimatedTitle({ html, locationHtml, className, style, locationStyle }: { html: string, locationHtml?: string, className?: string, style?: any, locationStyle?: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  let text = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  text = text.replace(/&nbsp;/g, ' ');
  let lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let locText = "";
  if (locationHtml) {
    locText = locationHtml
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    locText = locText.replace(/&nbsp;/g, ' ');
  }

  useEffect(() => {
    if (mounted && lines.length >= 2) {
      window.dispatchEvent(new CustomEvent('typographyStarted'));
      const numLetters = lines[0].replace(' ', '').length;
      const line0Done = (numLetters - 1) * 0.08 + 0.4;
      const highlightDone = line0Done + 0.6;
      const typeStart = highlightDone + 0.2;
      const typeDur = (locText || (lines.length > 2 ? lines.slice(2).join('\n') : '')).split('').length * 0.05;
      const wipeOutStart = typeStart + typeDur + 1.0;
      const totalDur = wipeOutStart + 0.6;

      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('typographyFinished'));
      }, totalDur * 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, html]);

  if (!mounted || lines.length < 2) {
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
  const actualLocText   = locText || (lines.length > 2 ? lines.slice(2).join('\n') : '');
  const typeChars       = actualLocText.split('');
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
      <div className="flex flex-wrap justify-center font-black tracking-tight w-full overflow-hidden" style={{ overflow: 'visible' }}>
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
            <span style={{ whiteSpace: 'pre-wrap' }}>{char}</span>
          </motion.span>
        ))}
      </div>

      {/* ── LINE 1: "Graphic Designer" ── */}
      <div className="w-full flex justify-center overflow-hidden">
        <div className="relative flex justify-center items-center font-black tracking-tight max-w-full">
          
          {/* Invisible text to dictate container height & width */}
          <div className="text-center pointer-events-none opacity-0">
            <span 
              className="whitespace-pre-wrap break-words"
              style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
            >
              {lines[1]}
            </span>
          </div>

          {/* Base text: White text (Original Font) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-0 max-w-full overflow-hidden"
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
            <div className="text-center">
              <span 
                className="whitespace-pre-wrap break-words"
                style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
              >
                {lines[1]}
              </span>
            </div>
          </motion.div>

          {/* Yellow mask: Black text with inline background */}
          <motion.div
            className="absolute inset-0 z-10 overflow-hidden"
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
            <div className="text-[#09090b] absolute inset-0 flex flex-col items-center justify-center max-w-full overflow-hidden">
              <div className="text-center">
                <span 
                  className="bg-yellow-400 whitespace-pre-wrap break-words"
                  style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
                >
                  {lines[1]}
                </span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
      {/* ── LINE 2: "based in..." ── */}
      <div className="flex justify-center items-center font-light hero-location px-4 text-center break-words max-w-full" style={{ minHeight: '1.4em', ...locationStyle }}>
        <span style={{ display: 'inline-block', position: 'relative', maxWidth: '100%' }}>
          {typeChars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ display: 'none' }}
              animate={{ display: 'inline' }}
              transition={{ delay: typeStart + i * typeCharDur }}
            >
              {char === '\n' ? <br /> : <span style={{ whiteSpace: 'pre-wrap' }}>{char}</span>}
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
