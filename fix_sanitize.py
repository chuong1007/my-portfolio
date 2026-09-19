with open('src/lib/sanitize.ts', 'r') as f:
    content = f.read()

import re

# We need to add svg and path to ALLOWED_TAGS
# and add fill, viewBox, xmlns, d to ALLOWED_ATTR
new_tags = "ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'ol', 'div', 'img', 'blockquote', 'code', 'pre', 'svg', 'path', 'g', 'circle', 'rect', 'line', 'polygon', 'polyline'],"
new_attr = "ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'width', 'height', 'fill', 'viewBox', 'xmlns', 'd', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],"

content = re.sub(r"ALLOWED_TAGS: \[[^\]]+\]\,", new_tags, content)
content = re.sub(r"ALLOWED_ATTR: \[[^\]]+\]\,", new_attr, content)

with open('src/lib/sanitize.ts', 'w') as f:
    f.write(content)
