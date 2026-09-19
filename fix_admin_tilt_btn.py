import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

old_btn = '                Replay Animation\n              </button>'
new_btn = """                Replay Animation
              </button>
              <button 
                onClick={() => setTiltDirection(prev => prev === 'inward' ? 'outward' : 'inward')}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors ml-4"
              >
                Nghiêng: {tiltDirection === 'inward' ? 'Hướng vào (Inward)' : 'Hướng ra (Outward)'}
              </button>"""

content = content.replace(old_btn, new_btn)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
print("Button added")
