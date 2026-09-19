import re

files_to_fix = [
    'src/components/GlobalPopup.tsx',
    'src/components/builder/PageRenderer.tsx'
]

for file in files_to_fix:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'import { cleanHtmlColors }' not in content:
        import_stmt = 'import { cleanHtmlColors } from "@/lib/sanitize";\n'
        first_import = content.find('import')
        content = content[:first_import] + import_stmt + content[first_import:]
        
    if 'GlobalPopup.tsx' in file:
        content = content.replace('__html: htmlContent', '__html: cleanHtmlColors(htmlContent)')
    elif 'PageRenderer.tsx' in file:
        content = content.replace('__html: getResponsiveValue(block?.content, globalPreviewMode || \'desktop\') || ""', '__html: cleanHtmlColors(getResponsiveValue(block?.content, globalPreviewMode || \'desktop\') || "")')

    with open(file, 'w') as f:
        f.write(content)
