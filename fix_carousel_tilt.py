import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Add to interface
content = content.replace(
    '  deviceMode?: "desktop" | "tablet" | "mobile";',
    '  deviceMode?: "desktop" | "tablet" | "mobile";\n  tiltDirection?: "inward" | "outward";'
)

# Add to function signature
content = content.replace(
    'deviceMode = "desktop" }: HeroIntroCarouselProps',
    'deviceMode = "desktop", tiltDirection = "inward" }: HeroIntroCarouselProps'
)

# Apply to desktop logic
old_ry = "ry = -sign * 35;"
new_ry = "ry = tiltDirection === 'outward' ? sign * 35 : -sign * 35;"
content = content.replace(old_ry, new_ry)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Carousel component updated to support tiltDirection")
