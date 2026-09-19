with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace('{isAdmin && isEditMode ? (', '{isAdmin && isEditMode && (')
content = content.replace('{isAdmin ? (', '{isAdmin && (')

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
