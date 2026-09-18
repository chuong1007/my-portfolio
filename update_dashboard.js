const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The ugly dashboard is:
/*
        {activeTab === 'dashboard' && !loading && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Admin Dashboard</h2>
            <p className="text-zinc-400 max-w-lg mx-auto mb-6">
              Đây là trang tổng quan. Vui lòng chọn một mục quản lý từ thanh điều hướng phía trên. 
              Sắp tới chúng tôi sẽ bổ sung các biểu đồ thống kê và truy cập nhanh tại đây.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
               <Link href="/admin/projects" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium">
                  Quản lý Dự án
               </Link>
               <button onClick={() => setActiveTab('homepage')} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium">
                  Tùy chỉnh Trang chủ
               </button>
               <Link href="/admin/blogs" className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors font-medium">
                  Viết Blog mới
               </Link>
            </div>
          </div>
        )}
*/

const newDashboardJSX = `
        {activeTab === 'dashboard' && !loading && (
          <div className="mt-8 space-y-8">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
              <p className="text-zinc-400">Đây là bảng điều khiển trung tâm. Tại đây bạn có thể quản lý toàn bộ nội dung trên website của mình.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Projects Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dự án ({projects?.length || 0})</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Quản lý, thêm mới và sắp xếp các dự án hiển thị trên trang chủ.</p>
                <Link href="/admin/projects" className="flex items-center justify-center w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Quản lý Dự án
                </Link>
              </div>

              {/* Homepage Content Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Trang chủ</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Tùy chỉnh nội dung text, thông tin About, và thông tin liên hệ.</p>
                <button onClick={() => setActiveTab('homepage')} className="flex items-center justify-center w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Tùy chỉnh Nội dung
                </button>
              </div>

              {/* Blogs Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Bài viết Blog</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Viết và xuất bản các bài viết chia sẻ kiến thức mới.</p>
                <Link href="/admin/blogs" className="flex items-center justify-center w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors text-sm font-medium">
                  Quản lý Blog
                </Link>
              </div>

              {/* Analytics Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Thống kê</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Theo dõi lượt truy cập và hiệu suất của website.</p>
                <button onClick={() => setActiveTab('analytics')} className="flex items-center justify-center w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Xem Thống kê
                </button>
              </div>

              {/* Popup Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Popup Quảng cáo</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Thiết lập popup hiển thị khi người dùng vào trang.</p>
                <button onClick={() => setActiveTab('popup')} className="flex items-center justify-center w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Cài đặt Popup
                </button>
              </div>
              
              {/* Pages Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Trang phụ</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">Quản lý các trang nội dung tĩnh khác.</p>
                <Link href="/admin/pages" className="flex items-center justify-center w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Quản lý Trang
                </Link>
              </div>
            </div>
          </div>
        )}
`;

const oldDashboardRegex = /\{activeTab === 'dashboard' && !loading && \([\s\S]*?<div className="bg-zinc-900\/50 border border-zinc-800 rounded-xl p-8 text-center mt-10">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/;
content = content.replace(oldDashboardRegex, newDashboardJSX);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard redesigned');
