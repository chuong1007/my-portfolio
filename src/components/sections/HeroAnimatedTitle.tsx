
"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stepEase = (t: number) => Math.floor(t * 16) / 16;

export function HeroAnimatedTitle({ html, locationHtml, className, style, locationStyle }: { html: string, locationHtml?: string, className?: string, style?: any, locationStyle?: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  let text = html
    .replace(/<\/(p|h[1-6]|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  text = text.replace(/&nbsp;/g, ' ');
  let lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let locText = "";
  if (locationHtml) {
    locText = locationHtml
      .replace(/<\/(p|h[1-6]|div)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    locText = locText.replace(/&nbsp;/g, ' ');
  }

  useEffect(() => {
    if (mounted && lines.length >= 2) {
      window.dispatchEvent(new CustomEvent('typographyStarted'));
      const numLetters = lines[0].replace(' ', '').length;
      const line0Done = (numLetters - 1) * 0.08 + 1.7;
      const highlightStart = line0Done - 0.4;
      const highlightDone = highlightStart + 0.6;
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
  const line0Done       = (numLetters - 1) * letterStagger + 1.7; // 1.7s is the new visual pop duration

  // Line 1: Highlight
  // Appear IMMEDIATELY after Visual is done
  const highlightStart  = line0Done - 0.4;    // Start 0.4s before Visual fully finishes gathering
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
    <div className={className} style={{
      ...style, 
      fontSize: (typeof window !== 'undefined' && window.innerWidth < 768) 
        ? `min(${style?.fontSize || '40px'}, 8.5vw)` 
        : style?.fontSize
    }}>

      {/* ── LINE 0: "Visual" ── */}
      <div className="flex flex-wrap justify-center font-black tracking-tight w-full overflow-hidden" style={{ overflow: 'visible' }}>
        {lines[0].split('').map((char, i, arr) => {
          const center = (arr.length - 1) / 2;
          const initialX = `calc(${(i - center)} * min(0.6em, 2vw))`;
          return (
            <motion.span
              key={i}
              initial={{ scale: 0, y: '50%', x: initialX, opacity: 0 }}
              animate={{ 
                scale:   [0,      1.4,     1,       1,       1], 
                y:       ['50%', '-10%',  '0%',    '0%',    '0%'], 
                x:       [initialX, initialX, initialX, initialX, 0], 
                opacity: [0,      1,       1,       1,       1] 
              }}
              transition={{
                duration: 1.7,
                delay: i * letterStagger,
                ease: ["easeOut", "easeInOut", "linear", "easeInOut"],
                times: [0, 0.28, 0.47, 0.76, 1]
              }}
              style={{ display: 'inline-block', transformOrigin: 'center bottom' }}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>{char}</span>
            </motion.span>
          );
        })}
      </div>

      {/* ── LINE 1: "Graphic Designer" ── */}
      <div className="w-full flex justify-center">
        <div className="relative flex justify-center items-center font-black tracking-tight max-w-full">
          
          {/* Invisible text to dictate container height & width */}
          <div className="text-center pointer-events-none opacity-0">
            <span 
              className="whitespace-nowrap"
              style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
            >
              {lines[1]}
            </span>
          </div>

          {/* I-beam Mouse Cursor for realistic selection effect */}
          <motion.div
            className="absolute z-50 pointer-events-none"
            initial={{ left: '10%', top: '40%', opacity: 0, x: '-50%', y: '-50%' }}
            animate={{
              left: ['10%', '10%', '0%', '0%', '100%', '105%', '105%'],
              top: ['40%', '40%', '20%', '20%', '80%', '90%', '90%'],
              opacity: [0, 0, 1, 1, 1, 0, 0],
              scale: [1, 1, 1, 0.9, 0.9, 1, 1] // press down right before sweep
            }}
            transition={{
              duration: T,
              times: [
                0,
                (highlightStart - 0.5) / T, // wait
                (highlightStart - 0.1) / T, // move into start position
                highlightStart / T,         // press down
                highlightDone  / T,         // sweep across
                (highlightDone + 0.2) / T,  // release and move away
                1,
              ],
              ease: ['linear', 'easeOut', 'easeOut', 'linear', 'easeOut', 'linear'],
            }}
          >
            <svg width="0.45em" height="0.9em" viewBox="0 0 32 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <path d="M10 8 h12 v3 h-4.5 v42 h4.5 v3 h-12 v-3 h4.5 v-42 h-4.5 z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="miter"/>
            </svg>
          </motion.div>

          {/* Base text: White text (Original Font) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0 max-w-full overflow-hidden">
            <div className="text-center">
              <motion.span
                style={{
                  WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 60%)',
                  WebkitMaskSize: '500% 100%',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitBoxDecorationBreak: 'clone',
                  boxDecorationBreak: 'clone',
                  display: 'inline',
                }}
                initial={{ WebkitMaskPosition: '100% 0%' } as any}
                                                    animate={{
                  WebkitMaskPosition: [
                    '100% 0%', 
                    '75% 0%',
                    '50% 0%',
                    '0% 0%',
                    '0% 0%'
                  ]
                } as any}
                transition={{
                  duration: T,
                  times: [
                    0, 
                    wipeOutStart / T, 
                    (wipeOutStart + highlightSweep) / T,
                    (wipeOutStart + highlightSweep + 0.01) / T,
                    1
                  ],
                  ease: ['linear', stepEase, 'linear', 'linear'],
                }}
              >
                <span 
                  className="whitespace-nowrap"
                  style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
                >
                  {lines[1]}
                </span>
              </motion.span>
            </div>
          </div>

          {/* Yellow mask: Black text with inline background AND line-by-line selection sweep */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="text-[#09090b] absolute inset-0 flex flex-col items-center justify-center max-w-full overflow-hidden">
              <div className="text-center">
                <motion.span
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent 28.5%, black 28.5%, black 71.5%, transparent 71.5%)',
                    WebkitMaskSize: '700% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitBoxDecorationBreak: 'clone',
                    boxDecorationBreak: 'clone',
                    display: 'inline',
                  }}
                  initial={{ WebkitMaskPosition: '100% 0%' } as any}
                  animate={{
                    WebkitMaskPosition: [
                      '100% 0%',
                      '83.333% 0%',
                      '66.666% 0%',
                      '33.333% 0%',
                      '16.666% 0%',
                      '0% 0%',
                      '0% 0%'
                    ]
                  } as any}
                  transition={{
                    duration: T,
                    times: [
                      0,
                      highlightStart / T,
                      highlightDone  / T,
                      wipeOutStart   / T,
                      (wipeOutStart + highlightSweep) / T,
                      (wipeOutStart + highlightSweep + 0.01) / T,
                      1
                    ],
                    ease: ['linear', stepEase, 'linear', stepEase, 'linear', 'linear'],
                  }}
                >
                  <span 
                    className="bg-yellow-400 whitespace-nowrap"
                    style={{ padding: '0.1em 0.12em 0.06em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
                  >
                    {lines[1]}
                  </span>
                </motion.span>
              </div>
            </div>
          </div>
          
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
