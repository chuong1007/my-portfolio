import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('useState<"inward" | "outward">', 'useState<"inward" | "outward" | "inward-reverse-scale">')

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
