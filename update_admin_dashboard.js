const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add 'dashboard' to activeTab state and set as default
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<'projects' \| 'homepage' \| 'analytics' \| 'popup'>\(\n\s*'projects'\n\s*\);/g,
  `const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'homepage' | 'analytics' | 'popup'>('dashboard');`
);

// Add a Dashboard link/button at the beginning of the tabs
content = content.replace(
  /<Link\n\s*href="\/admin\/blogs"/g,
  `<button
              onClick={() => setActiveTab('dashboard')}
              className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${
                activeTab === 'dashboard'
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }\`}
            >
              Dashboard
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <Link
              href="/admin/blogs"`
);

// Add Dashboard content block right after the header
content = content.replace(
  /\{activeTab === 'projects' && \(/g,
  `{activeTab === 'dashboard' && !loading && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Admin Dashboard</h2>
            <p className="text-zinc-400 max-w-lg mx-auto mb-6">
              Đây là trang tổng quan. Vui lòng chọn một mục quản lý từ thanh điều hướng phía trên. 
              Sắp tới chúng tôi sẽ bổ sung các biểu đồ thống kê và truy cập nhanh tại đây.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
               <button onClick={() => setActiveTab('projects')} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium">
                  Quản lý Dự án
               </button>
               <button onClick={() => setActiveTab('homepage')} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium">
                  Tùy chỉnh Trang chủ
               </button>
               <Link href="/admin/blogs" className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors font-medium">
                  Viết Blog mới
               </Link>
            </div>
          </div>
        )}
        {activeTab === 'projects' && (`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added Dashboard tab to admin page!');
