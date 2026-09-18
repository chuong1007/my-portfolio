const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure LogOut icon is imported
if (!content.includes('import { LogOut }')) {
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { LogOut } from "lucide-react";');
}

const headerRegex = /<header className="sticky top-0 z-50 bg-zinc-950\/90 backdrop-blur-md border-b border-zinc-800">[\s\S]*?<\/header>/;

const newHeader = `<header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 -mx-6 px-6 xl:mx-0 xl:px-0">
            <div className="flex items-center gap-3 shrink-0">
              <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
                ← Về trang chủ
              </a>
              <span className="text-zinc-700">|</span>
              <Link href="/admin" className="text-base font-black text-white tracking-widest hover:text-zinc-300 transition-colors">ADMIN</Link>
            </div>
            
            <div className="w-px h-6 bg-zinc-800 shrink-0 hidden md:block" />

            <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50 shrink-0">
              <Link href="/admin" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}\`}>Dashboard</Link>
              <Link href="/admin/blogs" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/blogs' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'}\`}>Blog</Link>
              <Link href="/admin/pages" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/pages' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}\`}>Trang phụ</Link>
              <Link href="/admin/projects" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/projects' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}\`}>Dự án</Link>
              <Link href="/admin/homepage" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/homepage' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}\`}>Trang chủ</Link>
              <Link href="/admin/analytics" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/analytics' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'}\`}>Analytics</Link>
              <Link href="/admin/popup" className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '/admin/popup' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-500 hover:text-pink-400 hover:bg-pink-500/10'}\`}>Popup</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 absolute xl:relative top-4 right-6 xl:top-0 xl:right-0">
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>`;

content = content.replace(headerRegex, newHeader);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed admin header nav');
