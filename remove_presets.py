import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

preset_regex = re.compile(r'<div className="flex flex-wrap gap-2 mb-8">.*?</div>', re.DOTALL)
content = preset_regex.sub('', content)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
