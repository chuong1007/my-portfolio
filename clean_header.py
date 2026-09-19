with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { LoginModal } from "@/components/admin/LoginModal";\n', '')
content = content.replace('<LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />\n', '')

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
