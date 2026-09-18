const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Remove the button from its current location inside the expandedBlocks
const oldBtnRegex = /\s*\{isEditor && \(\s*<div className="absolute top-24 right-4 md:right-8 z-50">[\s\S]*?<\/div>\s*\)\}/;
content = content.replace(oldBtnRegex, '');

// Step 2: Inject the button just before the closing </section> tag
const newBtnHtml = `
        {isEditor && isExpanded && (
          <div className="absolute bottom-16 right-4 md:right-8 z-[100]">
            <a
              href="/admin/about"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center bg-white text-black p-3 rounded-full border border-white/20 hover:bg-zinc-200 transition-all duration-300 shadow-xl pointer-events-auto"
              title="Chỉnh sửa cột mở rộng"
            >
              <Pencil className="w-5 h-5" />
            </a>
          </div>
        )}
      </section>
`;
content = content.replace(/\s*<\/section>/, '\n' + newBtnHtml);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Moved edit button to absolute bottom right of section');
