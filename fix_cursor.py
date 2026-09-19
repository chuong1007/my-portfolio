with open('src/components/sections/HeroAnimatedTitle.tsx', 'r') as f:
    content = f.read()

# The missing I-beam cursor block
missing_cursor = """
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
                Math.max(0, (highlightStart - 0.4) / T),
                Math.max(0, (highlightStart - 0.1) / T),
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
"""

# Find where to insert it (just before the words logic)
import_marker = "{/* Characters Grouped by Words to Prevent Mid-Word Wrapping */}"
content = content.replace(import_marker, missing_cursor + "\n          " + import_marker)

# Remove the word-level cursors
import re
# The word cursor is a <motion.div className="absolute z-20 pointer-events-none" ...> ... </motion.div>
# It spans multiple lines, up to the </svg>\n                  </motion.div>
word_cursor_pattern = re.compile(r'\{\/\* WORD-LEVEL SWEEPING CURSOR \*\/\}[\s\S]*?<\/svg>\s*<\/motion\.div>', re.MULTILINE)
content = word_cursor_pattern.sub('', content)

with open('src/components/sections/HeroAnimatedTitle.tsx', 'w') as f:
    f.write(content)
