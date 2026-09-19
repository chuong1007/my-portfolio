import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Replace the ringZ logic in the wrapper
old_ring_wrapper = re.compile(r'const isConcave = tiltDirection === \'inward\';\s*const directionSign = isConcave \? -1 : 1;\s*const ringZ = -directionSign \* R;', re.DOTALL)
new_ring_wrapper = """const zSign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
          const ringZ = -zSign * R;"""
content = old_ring_wrapper.sub(new_ring_wrapper, content)

# Replace the variables inside the map loop
old_card_logic = re.compile(r'const isConcave = tiltDirection === \'inward\';\s*const directionSign = isConcave \? -1 : 1;\s*let x = 0, y = 0, z = 0, ry = 0, rz = 0, scale = 1;', re.DOTALL)
new_card_logic = """let zSign = 1;
            let rySign = 1;
            if (tiltDirection === 'outward') {
              zSign = 1;
              rySign = -1;
            } else if (tiltDirection === 'inward-reverse-scale') {
              zSign = -1;
              rySign = 1;
            } else {
              zSign = 1;
              rySign = 1;
            }
            
            let x = 0, y = 0, z = 0, ry = 0, rz = 0, scale = 1;"""
content = old_card_logic.sub(new_card_logic, content)

# Replace the math calculations
old_math = re.compile(r'ry = directionSign \* offset \* thetaDeg;\s*z = directionSign \* R;')
new_math = """ry = rySign * offset * thetaDeg;
              z = zSign * R;"""
content = old_math.sub(new_math, content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
