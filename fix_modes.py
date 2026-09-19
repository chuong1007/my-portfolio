import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# Fix ringZ
ringz_regex = re.compile(r'const zSign = tiltDirection === \'inward-reverse-scale\' \? -1 : 1;\s*const ringZ = -zSign \* R;', re.DOTALL)
new_ringz = """const zSign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
          const ringZ = tiltDirection === 'inward' ? 0 : -zSign * R;"""
content = ringz_regex.sub(new_ringz, content)


# Replace the math loop logic
math_regex = re.compile(r'let zSign = 1;.*?if \(absOffset > 3\) opacity = 0;\s*\}', re.DOTALL)
new_math = """let x = 0, y = 0, z = 0, ry = 0, rz = 0, scale = 1;
            let opacity = 1;
            let zIndex = 100 - Math.abs(offset);
            let cardOpacity = 1;
            let cardBlur = 0;
            let cardBrightness = 1;
            
            if (isMobileDevice) {
              const distance = Math.abs(offset);
              if (offset < 0) {
                // Drop straight down and fade out
                y = 500; z = 0; scale = 0.8; x = 0; ry = 0; rz = 0; zIndex = 101; cardOpacity = 1; cardBlur = 0; opacity = 0; 
              } else {
                y = distance * -30 + 20; z = -distance * 50; scale = 1 - distance * 0.04; x = 0; ry = 0; rz = distance * 4; zIndex = 100 - distance;
                cardOpacity = distance > 2 ? 0 : (1 - distance * 0.15); cardBlur = distance > 0 ? distance * 1.0 : 0; opacity = distance > 2 ? 0 : 1; 
              }
            } else {
              const absOffset = Math.abs(offset);
              
              if (tiltDirection === 'inward') {
                // Linear V-Shape (Hướng xen kẽ)
                x = offset * (w_card_val + g_card);
                z = -absOffset * (perspectiveMultiplier * 100);
                ry = -offset * thetaDeg; // Face inward
                
                if (absOffset <= 1) {
                  opacity = 1; cardBlur = 0; cardBrightness = 1;
                } else if (absOffset === 2) {
                  opacity = 1; cardBlur = 3 * blurStrength; cardBrightness = 1 - (0.25 * dimStrength);
                } else {
                  opacity = 0.85; cardBlur = 8 * blurStrength; cardBrightness = 1 - (0.5 * dimStrength);
                  if (absOffset > 3) opacity = 0;
                }
              } else {
                // Pure Cylinder (Hướng ra & Lớn dần ra ngoài)
                let zSign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
                // For cylinder, ry must match the position offset to stay on the correct side
                // outward (convex): ry = positive for right side (Faces Outward)
                // inward-reverse (concave): ry = negative for right side (Faces Inward)
                let rySign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
                
                ry = rySign * offset * thetaDeg;
                z = zSign * R;
                
                if (absOffset <= 1) {
                  opacity = 1; cardBlur = 0; cardBrightness = 1;
                } else if (absOffset === 2) {
                  opacity = 1; cardBlur = 3 * blurStrength; cardBrightness = 1 - (0.25 * dimStrength);
                } else {
                  opacity = 0.85; cardBlur = 8 * blurStrength; cardBrightness = 1 - (0.5 * dimStrength);
                  if (absOffset > 3) opacity = 0;
                }
              }
            }"""
content = math_regex.sub(new_math, content)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
