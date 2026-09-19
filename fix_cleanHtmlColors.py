import re
import glob

files = [
    'src/components/BlogDetail.tsx',
    'src/components/ProjectDetail.tsx',
    'src/components/sections/About.tsx',
    'src/components/sections/Blog.tsx',
    'src/components/sections/Contact.tsx',
    'src/components/sections/Gallery.tsx',
    'src/components/sections/Hero.tsx',
]

def_regex = re.compile(r'const cleanHtmlColors = \(.*?\}?;', re.DOTALL)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'cleanHtmlColors =' in content:
        # Remove the function definition
        content = def_regex.sub('', content)
        
        # Add import at the top
        import_stmt = 'import { cleanHtmlColors } from "@/lib/sanitize";\n'
        
        if 'import' in content:
            # find first import
            first_import = content.find('import')
            content = content[:first_import] + import_stmt + content[first_import:]
        else:
            content = import_stmt + content
            
        with open(file, 'w') as f:
            f.write(content)
