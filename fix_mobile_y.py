import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Replace y = distance * -30;
content = content.replace(
    'y = distance * -30; // Shifts upward',
    'y = distance * -30 + 20; // Shifts upward but entire stack lowered by 20px'
)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Updated mobile Y offset")
