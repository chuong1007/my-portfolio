with open('src/components/sections/HeroAnimatedTitle.tsx', 'r') as f:
    content = f.read()

old_times = """              times: [
                0,
                Math.max(0, (highlightStart - 0.4) / T),
                Math.max(0, (highlightStart - 0.1) / T),
                highlightStart / T,
                highlightDone / T,
                Math.min(1, (highlightDone + 0.2) / T),
                1
              ],"""
new_times = """              times: [
                0,
                Math.max(0, (highlightStart - 0.75) / T),
                Math.max(0, (highlightStart - 0.45) / T),
                highlightStart / T,
                highlightDone / T,
                Math.min(1, (highlightDone + 0.2) / T),
                1
              ],"""

content = content.replace(old_times, new_times)

with open('src/components/sections/HeroAnimatedTitle.tsx', 'w') as f:
    f.write(content)
