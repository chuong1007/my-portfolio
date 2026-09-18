const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /className="overflow-hidden"/g,
  'className="overflow-hidden relative"'
);

const btnHtml = `
                  {isEditor && (
                    <div className="absolute top-20 right-0 z-50 p-4">
                      <a
                        href="/admin/about"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all font-medium border border-blue-400/30 group cursor-pointer"
                      >
                        <span className="text-sm">Chỉnh sửa Cột mở rộng</span>
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  )}
`;

content = content.replace(
  /<div className=\{cn\(\s*"mt-16 pt-16/g,
  btnHtml + '<div className={cn("mt-16 pt-16'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added floating edit button to About');
