import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Replace the apple-dot keyframes
old_keyframes = """@keyframes apple-dot {
  0%, 15%, 100% {
    height: 4px;
    opacity: 0.25;
    background-color: var(--text-muted);
  }
  5% {
    height: 14px;
    opacity: 1;
    background-color: var(--text-primary);
  }
}"""

new_keyframes = """@keyframes apple-dot {
  0%, 100% {
    height: 4px;
    opacity: 0.25;
    background-color: var(--text-muted);
  }
  25% {
    height: 16px;
    opacity: 1;
    background-color: var(--text-primary);
  }
  50% {
    height: 4px;
    opacity: 0.25;
    background-color: var(--text-muted);
  }
}"""

content = content.replace(old_keyframes, new_keyframes)

with open('src/app/globals.css', 'w') as f:
    f.write(content)
