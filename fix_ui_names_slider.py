import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

# Rename "Hướng vào" to "Hướng xen kẽ"
content = content.replace("Nghiêng: {tiltDirection === 'inward' ? 'Hướng vào (Inward)' : tiltDirection === 'outward' ? 'Hướng ra (Outward)' : 'Lớn dần ra ngoài'}", "Nghiêng: {tiltDirection === 'inward' ? 'Hướng xen kẽ (Inward)' : tiltDirection === 'outward' ? 'Hướng ra (Outward)' : 'Lớn dần ra ngoài'}")
content = content.replace("Cấu hình 3D ({tiltDirection === 'inward' ? 'Hướng vào'", "Cấu hình 3D ({tiltDirection === 'inward' ? 'Hướng xen kẽ'")

# Change the gap slider min to -100
gap_slider = re.compile(r'<input\s+type="range"\s+min="0"\s+max="100".*?value=\{activeConfig\.gap\}')
content = gap_slider.sub('<input type="range" min="-100" max="100" value={activeConfig.gap}', content)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
