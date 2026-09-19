with open('src/app/loading.tsx', 'r') as f:
    content = f.read()

content = content.replace("duration-[80ms]", "duration-100")

with open('src/app/loading.tsx', 'w') as f:
    f.write(content)
