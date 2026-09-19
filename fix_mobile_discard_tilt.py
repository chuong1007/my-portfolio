import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Replace the mobile discard animation
discard_regex = re.compile(r'// Drop straight down and fade out\s*y = 500; z = 0; scale = 0\.8; x = 0; ry = 0; rz = 0; zIndex = 101; cardOpacity = 1; cardBlur = 0; opacity = 0;')
new_discard = """// Drop down with a tilt
                y = 500; z = 0; scale = 0.8; x = -50; ry = 0; rz = -25; zIndex = 101; cardOpacity = 1; cardBlur = 0; opacity = 0;"""
content = discard_regex.sub(new_discard, content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
