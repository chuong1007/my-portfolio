import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Replace both occurrences
content = content.replace(
    "const isConcave = tiltDirection === 'inward-reverse-scale';",
    "const isConcave = tiltDirection === 'inward';"
)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

# Make the toggle switch outward -> inward-reverse-scale -> inward
# Actually, if inward = Concave and outward = Convex, what is inward-reverse-scale?
# Maybe inward-reverse-scale is Concave but with inverted Z? 
