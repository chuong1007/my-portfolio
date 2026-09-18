const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the header section:
// {/* Header */}
// <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"> ... </div>

let startIndex = content.indexOf('{/* Header */}');
let endIndex = content.indexOf('{/* Tags Management Integrated */}');

if (startIndex !== -1 && endIndex !== -1) {
    const oldHeader = content.substring(startIndex, endIndex);
    const newHeader = `
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors text-white">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <LayoutDashboard className="w-6 h-6 text-emerald-400" />
              Quản Lý Dự Án
            </h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mt-1">
              {projects.length} DỰ ÁN HIỆN CÓ TRÊN HỆ THỐNG
            </p>
          </div>
        </div>
        <button onClick={() => setShowProjectForm(true)} className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
          <Plus className="w-5 h-5" />
          Thêm Dự Án Mới
        </button>
      </div>

      `;
    content = content.replace(oldHeader, newHeader);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed projects header');
