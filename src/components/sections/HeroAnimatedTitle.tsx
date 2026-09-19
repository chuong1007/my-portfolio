
"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stepEase = (t: number) => Math.floor(t * 16) / 16;

export function HeroAnimatedTitle({ html, locationHtml, className, style, locationStyle, startDelay = 0 }: { html: string, locationHtml?: string, className?: string, style?: any, locationStyle?: any, startDelay?: number }) {
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
      }, (startDelay + totalDur) * 1000);
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
      fontSize: style?.fontSize
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
              transition={{ duration: 1.7,
                delay: startDelay + i * letterStagger,
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

            {/* ── LINE 1: "Graphic Designer" (Character by Character) ── */}
      <div className="w-full flex justify-center mt-2 mb-2">
        <div className="relative flex justify-center items-center font-black tracking-tight max-w-full flex-wrap text-center leading-[1.1]">
          
          

          
          {/* I-beam Mouse Cursor */}
          <motion.div
            className="absolute z-50 pointer-events-none text-white"
            initial={{ left: '10%', top: '40%', opacity: 0, x: '-50%', y: '-50%' }}
            animate={{
              left:    ['10%', '10%', '0%',   '0%',   '100%', '105%', '105%'],
              top:     ['40%', '40%', '20%',  '20%',  '80%',  '90%',  '90%'],
              opacity: [0, 0, 1, 1, 1, 0, 0],
              scale:   [1,     1,     0.9,    0.9,    0.9,    1,      1]
            }}
            transition={{ delay: startDelay,
              duration: T,
              times: [
                0,
                Math.max(0, (highlightStart - 0.75) / T),
                Math.max(0, (highlightStart - 0.45) / T),
                highlightStart / T,
                highlightDone / T,
                Math.min(1, (highlightDone + 0.2) / T),
                1
              ],
              ease: "linear"
            }}
          >
            <svg width="0.25em" height="0.95em" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md" style={{ transform: 'translateY(-0.05em)' }}>
              <g stroke="white" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 25 25 C 45 25 50 35 50 50 L 50 150 C 50 165 45 175 25 175" />
                <path d="M 75 25 C 55 25 50 35 50 50 L 50 150 C 50 165 55 175 75 175" />
                <line x1="30" y1="100" x2="70" y2="100" />
              </g>
              <g stroke="black" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 25 25 C 45 25 50 35 50 50 L 50 150 C 50 165 45 175 25 175" />
                <path d="M 75 25 C 55 25 50 35 50 50 L 50 150 C 50 165 55 175 75 175" />
                <line x1="30" y1="100" x2="70" y2="100" />
              </g>
            </svg>
          </motion.div>

          {/* Characters Grouped by Words to Prevent Mid-Word Wrapping */}
          {(() => {
            let absoluteIndex = 0;
            const words = lines[1].split(' ');
            const numChars = lines[1].length;
            const highlightCharDur = highlightSweep / numChars;
            const wipeCharDur = wipeOutDur / numChars;

            return words.map((word, wIdx) => {
              
              const wordStartIndex = absoluteIndex;
              const wordCharCount = word.length + (wIdx < words.length - 1 ? 1 : 0);
              const wordEndIndex = wordStartIndex + wordCharCount;
              
              const tWordHighlightStart = highlightStart + wordStartIndex * highlightCharDur;
              const tWordHighlightEnd = highlightStart + wordEndIndex * highlightCharDur;
              const tWordWipeStart = wipeOutStart + (numChars - 1 - (wordEndIndex - 1)) * wipeCharDur;
              const tWordWipeEnd = wipeOutStart + (numChars - 1 - wordStartIndex) * wipeCharDur + wipeCharDur;

              return (
                <span key={wIdx} className="relative" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                  

                  {word.split('').map((char, cIdx) => {
                    const i = absoluteIndex++;
                    const tHighlight = highlightStart + i * highlightCharDur;
                    const tWipe = wipeOutStart + (numChars - 1 - i) * wipeCharDur;
                    
                    const commonTransition = {
                      delay: startDelay,
                      duration: T,
                      times: [
                        0,
                        tHighlight / T,
                        (tHighlight + 0.01) / T,
                        tWipe / T,
                        (tWipe + 0.01) / T,
                        1
                      ],
                      ease: "linear" as const
                    };

                    return (
                      <span
                        key={cIdx}
                        style={{ 
                          display: 'inline-block',
                          position: 'relative',
                          padding: '0.05em 0 0.18em',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        <motion.span
                          style={{ position: 'absolute', inset: '0 -1px', zIndex: -1 }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0, 1, 1, 1, 1],
                            backgroundColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', '#facc15', '#facc15', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']
                          }}
                          transition={commonTransition}
                        />
                        <motion.span
                          style={{ position: 'relative', zIndex: 1, display: 'inline-block' }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0, 1, 1, 1, 1],
                            color: ['#000000', '#000000', '#000000', '#000000', 'var(--text-primary)', 'var(--text-primary)']
                          }}
                          transition={commonTransition}
                        >
                          {char}
                        </motion.span>
                      </span>
                    );
                  })}
                  
                  {/* Space character between words */}
                  {wIdx < words.length - 1 && (() => {
                    const i = absoluteIndex++;
                    const tHighlight = highlightStart + i * highlightCharDur;
                    const tWipe = wipeOutStart + (numChars - 1 - i) * wipeCharDur;
                    
                    const commonTransition = {
                      delay: startDelay,
                      duration: T,
                      times: [
                        0,
                        tHighlight / T,
                        (tHighlight + 0.01) / T,
                        tWipe / T,
                        (tWipe + 0.01) / T,
                        1
                      ],
                      ease: "linear" as const
                    };

                    return (
                      <span
                        key="space"
                        style={{ 
                          display: 'inline-block',
                          position: 'relative',
                          padding: '0.05em 0 0.18em',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        <motion.span
                          style={{ position: 'absolute', inset: '0 -1px', zIndex: -1 }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0, 1, 1, 1, 1],
                            backgroundColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', '#facc15', '#facc15', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']
                          }}
                          transition={commonTransition}
                        />
                        <motion.span
                          style={{ position: 'relative', zIndex: 1, display: 'inline-block' }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0, 1, 1, 1, 1],
                            color: ['#000000', '#000000', '#000000', '#000000', 'var(--text-primary)', 'var(--text-primary)']
                          }}
                          transition={commonTransition}
                        >
                          {` `}
                        </motion.span>
                      </span>
                    );
                  })()}
                </span>
              );
            });
          })()}
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
              transition={{ delay: startDelay + typeStart + i * typeCharDur }}
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
            transition={{ delay: startDelay,
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
