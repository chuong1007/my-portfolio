import os

files = [
    'src/components/BlogDetail.tsx',
    'src/components/ProjectDetail.tsx',
    'src/components/sections/About.tsx',
    'src/components/sections/Blog.tsx',
    'src/components/sections/Contact.tsx',
    'src/components/sections/Gallery.tsx',
    'src/components/sections/Hero.tsx',
]

old_block = """const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  return html
    .replace(/color:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi, 'color: inherit')
    .replace(/-webkit-text-fill-color:\s*transparent/gi, '')
    .replace(/background:\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\s*text/gi, '');
};"""

old_block_alt = """
  return html
    .replace(/color:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi, 'color: inherit')
    .replace(/-webkit-text-fill-color:\s*transparent/gi, '')
    .replace(/background:\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\s*text/gi, '');
};"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if old_block_alt in content:
        content = content.replace(old_block_alt, '')
        
    with open(file, 'w') as f:
        f.write(content)
