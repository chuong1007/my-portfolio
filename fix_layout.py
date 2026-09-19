with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

import_statement = "import NextTopLoader from 'nextjs-toploader';\n"
if "nextjs-toploader" not in content:
    content = content.replace('import { SmoothScrollSnap } from "@/components/SmoothScrollSnap";\n', 'import { SmoothScrollSnap } from "@/components/SmoothScrollSnap";\n' + import_statement)

toploader_tag = '<NextTopLoader color="#facc15" showSpinner={false} shadow="0 0 10px #facc15,0 0 5px #facc15" zIndex={9999} />\n'
if "NextTopLoader" not in content.replace(import_statement, ''):
    content = content.replace('<ThemeProvider>\n', '<ThemeProvider>\n          ' + toploader_tag)

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
