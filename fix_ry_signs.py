import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Fix rySign logic
old_logic = re.compile(r'if \(tiltDirection === \'outward\'\) \{.*?\} else \{.*?\}', re.DOTALL)
new_logic = """if (tiltDirection === 'outward') {
              zSign = 1;
              rySign = 1; // Faces OUTWARD (Right side faces Right)
            } else if (tiltDirection === 'inward-reverse-scale') {
              zSign = -1;
              rySign = -1; // Faces INWARD (Stadium screen)
            } else {
              // inward (Hướng xen kẽ)
              zSign = 1;
              rySign = -1; // Faces INWARD
            }"""
content = old_logic.sub(new_logic, content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
