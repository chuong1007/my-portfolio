import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '"w-[220px]"',
    '"w-[235px]"'
)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Width updated to 235px")
