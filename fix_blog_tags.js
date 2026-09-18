const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/blogs/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix tags container to wrap and tags to not wrap internally
content = content.replace(
  /<div className="flex items-center gap-2 mt-0\.5">/g,
  '<div className="flex flex-wrap items-center gap-2 mt-0.5">'
);
content = content.replace(
  /className="text-\[9px\] px-1\.5 py-0\.5 bg-zinc-800 text-zinc-500 rounded"/g,
  'className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded whitespace-nowrap"'
);

// We should also remove slice(0, 2) if the user wants "show đủ ra hết"
content = content.replace(
  /blog\.tags\?\.slice\(0, 2\)\.map/g,
  'blog.tags?.map'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed tags wrapping in Blog cards!');
