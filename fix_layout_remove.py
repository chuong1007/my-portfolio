with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import NextTopLoader from 'nextjs-toploader';\n", "")
content = content.replace('<NextTopLoader color="#facc15" showSpinner={false} shadow="0 0 10px #facc15,0 0 5px #facc15" zIndex={9999} />\n', "")
# Also maybe check for spaces before it
import re
content = re.sub(r'\s*<NextTopLoader[^>]+>\s*', '\n', content)

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
