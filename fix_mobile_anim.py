import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Let's change the discard animation to not "fall to the left"
# Instead of x = -200 and rz = -15, let's make it drop down and fade out
mobile_discard = re.compile(r'if \(offset < 0\) \{.*?opacity = 0;\s*\} else \{', re.DOTALL)
new_mobile_discard = """if (offset < 0) {
                // Drop straight down and fade out
                y = 500; z = 0; scale = 0.8; x = 0; ry = 0; rz = 0; zIndex = 101; cardOpacity = 1; cardBlur = 0; opacity = 0; 
              } else {"""
content = mobile_discard.sub(new_mobile_discard, content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
