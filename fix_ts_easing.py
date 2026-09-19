import re

with open('src/components/sections/HeroIntroCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const [slideConfig, setSlideConfig] = useState({ duration: 0.32, ease: "linear" });',
    'const [slideConfig, setSlideConfig] = useState<{ duration: number; ease: any }>({ duration: 0.32, ease: "linear" });'
)

with open('src/components/sections/HeroIntroCarousel.tsx', 'w') as f:
    f.write(content)
print("Fixed TS easing error")
