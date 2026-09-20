import os

files = [
    'src/components/AIChatbot/ChatPanel.tsx',
    'src/components/admin/AITab.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Simple replace for 'Anh/chị' -> 'Anh/ Chị'
    content = content.replace('Anh/chị', 'Anh/ Chị')
    
    with open(file, 'w') as f:
        f.write(content)

