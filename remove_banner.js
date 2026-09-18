const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The banner code is:
// <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
//   <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
//   <p className="text-zinc-400">Đây là bảng điều khiển trung tâm. Tại đây bạn có thể quản lý toàn bộ nội dung trên website của mình.</p>
// </div>

const regex = /<div className="bg-gradient-to-r from-zinc-900 to-zinc-900\/50 border border-zinc-800 rounded-2xl p-8">[\s\S]*?<\/div>/;
content = content.replace(regex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed welcome banner');
