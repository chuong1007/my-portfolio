import re

with open('src/components/sections/HeroAnimatedTitle.tsx', 'r') as f:
    content = f.read()

# The main cursor is right after {/* I-beam Mouse Cursor */}
main_cursor_regex = re.compile(r'\{\/\* I-beam Mouse Cursor \*\/\}[\s\S]*?</motion\.div>', re.DOTALL)
content = main_cursor_regex.sub('', content)

with open('src/components/sections/HeroAnimatedTitle.tsx', 'w') as f:
    f.write(content)
