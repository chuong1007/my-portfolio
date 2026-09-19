import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

content = re.sub(r'@keyframes apple-dot \{[\s\S]*?\.animate-apple-dot \{[\s\S]*?\}', '', content)

with open('src/app/globals.css', 'w') as f:
    f.write(content)
