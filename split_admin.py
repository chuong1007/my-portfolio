import re

with open("src/app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will just write a simple script that prints out the location of tabs
lines = content.split('\n')
for i, line in enumerate(lines):
    if "activeTab ===" in line and "&&" in line and "{" in line:
        print(f"Tab start at {i}: {line.strip()}")
