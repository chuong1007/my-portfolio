import re

with open('src/components/ProjectDetail.tsx', 'r') as f:
    content = f.read()

old_block = """        {/* Zoom Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-[var(--text-primary)]">"""

new_block = """        {/* Zoom Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-white">"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Not found!")

with open('src/components/ProjectDetail.tsx', 'w') as f:
    f.write(content)
