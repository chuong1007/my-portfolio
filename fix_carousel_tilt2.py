import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# abs === 2
content = content.replace(
    'ry = -sign * 45; // More slant',
    'ry = tiltDirection === "outward" ? sign * 45 : -sign * 45; // More slant'
)

# abs === 3 or more
content = content.replace(
    'ry = -sign * 55; // Even more',
    'ry = tiltDirection === "outward" ? sign * 55 : -sign * 55; // Even more'
)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Carousel component updated for deeper cards tilt")
