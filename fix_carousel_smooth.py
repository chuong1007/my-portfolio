import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

# 1. Add slideConfig state
content = content.replace(
    'const [isShrunk, setIsShrunk] = useState(false);',
    'const [isShrunk, setIsShrunk] = useState(false);\n  const [slideConfig, setSlideConfig] = useState({ duration: 0.32, ease: "linear" });'
)

# 2. Rewrite the interval loop to recursive timeout
old_loop = """      let step = 0;
      // We can slide through N cards
      const maxSteps = 8; // Only slide one original loop 
      
      const interval = setInterval(() => {
        if (step < maxSteps) {
          step++;
          setCurrentIndex(step % N);
          
          // Khi lướt tới nhịp cuối (quay về ảnh đầu tiên), lập tức kích hoạt mờ dần luôn
          if (step === maxSteps) {
            setPhase("finished");
            clearInterval(interval);
            onComplete();
            
            setTimeout(() => {
              setPhase("hidden");
            }, 6450);
          }
        }
      }, 320);
      
      return () => clearInterval(interval);"""

new_loop = """      let step = 0;
      const maxSteps = 8; // Only slide one original loop
      let currentTimeout: NodeJS.Timeout;

      const nextSlide = () => {
        if (step < maxSteps) {
          step++;
          setCurrentIndex(step % N);
          
          // Tính toán tốc độ trượt (chậm dần đều ở những bước cuối)
          let currentDelay = 320; 
          let currentEase = "linear";
          
          if (step === maxSteps - 2) {
             currentDelay = 450;
             currentEase = "linear";
          } else if (step === maxSteps - 1) {
             currentDelay = 650;
             currentEase = "easeOut";
          } else if (step === maxSteps) {
             currentDelay = 1000;
             currentEase = "easeOut";
          }
          
          setSlideConfig({ duration: currentDelay / 1000, ease: currentEase });

          if (step === maxSteps) {
            // Khi đã chạy tới bước cuối, chờ animation cuối hoàn thành rồi mới chuyển phase
            currentTimeout = setTimeout(() => {
              setPhase("finished");
              onComplete();
              setTimeout(() => {
                setPhase("hidden");
              }, 6450);
            }, currentDelay);
          } else {
            currentTimeout = setTimeout(nextSlide, currentDelay);
          }
        }
      };
      
      currentTimeout = setTimeout(nextSlide, 320);
      
      return () => clearTimeout(currentTimeout);"""

content = content.replace(old_loop, new_loop)

# 3. Apply slideConfig to transition
old_transition = """                  ease: phase === "slide" ? "linear" : undefined,
                  duration: phase === "slide" ? 0.32 : undefined"""

new_transition = """                  ease: phase === "slide" ? slideConfig.ease : undefined,
                  duration: phase === "slide" ? slideConfig.duration : undefined"""

content = content.replace(old_transition, new_transition)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Updated to smooth deceleration loop")
