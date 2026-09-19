import re

# 1. Update Hero.tsx
with open('src/components/sections/Hero.tsx', 'r') as f:
    hero = f.read()

hero = hero.replace(
    'customCarouselImages?: any[];',
    'customCarouselImages?: any[];\n  tiltDirection?: "inward" | "outward";'
)

hero = hero.replace(
    'customCarouselImages }: HeroProps',
    'customCarouselImages, tiltDirection = "inward" }: HeroProps'
)

hero = hero.replace(
    'projects={finalProjects}',
    'projects={finalProjects}\n            tiltDirection={tiltDirection}'
)

with open('src/components/sections/Hero.tsx', 'w') as f:
    f.write(hero)

# 2. Update page.tsx
with open('src/app/page.tsx', 'r') as f:
    page = f.read()

page = page.replace(
    'customCarouselImages={contentMap[\'hero_carousel\']?.images || undefined}',
    'customCarouselImages={contentMap[\'hero_carousel\']?.images || undefined} tiltDirection={contentMap[\'hero_carousel\']?.tiltDirection || \'inward\'}'
)

with open('src/app/page.tsx', 'w') as f:
    f.write(page)

print("Hero and page updated to support tiltDirection")
