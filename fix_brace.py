import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace("            }\n            }\n\n            // Pop up", "            }\n\n            // Pop up")

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
