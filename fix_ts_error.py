import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const newImages = [];',
    'const newImages: CarouselImage[] = [];'
)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
print("Fixed TS error")
