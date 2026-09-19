import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

debug_regex = re.compile(r'\s*onAnimationComplete=\{\(\) => \{.*?\}\}', re.DOTALL)
content = debug_regex.sub('', content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
