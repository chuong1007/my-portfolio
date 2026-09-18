const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The old header looks like:
// {/* Header */}
// <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//   <div>
//     <h1 className="text-3xl font-bold">Trang Quản Trị</h1>
//     ...
//   </div>
//   ...
// </div>

const startIdx = content.indexOf('{/* Header */}');
const dashboardIdx = content.indexOf('{/* ── BẢNG ĐIỀU KHIỂN DASHBOARD ── */}');

if (startIdx !== -1 && dashboardIdx !== -1) {
    content = content.substring(0, startIdx) + content.substring(dashboardIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Removed old header from admin/page.tsx');
} else {
    console.log('Could not find markers', startIdx, dashboardIdx);
}
