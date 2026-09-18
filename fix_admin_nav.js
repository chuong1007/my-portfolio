const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<div className="flex items-center gap-1.5 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50 shrink-0">',
  '<div className="flex items-center gap-6 shrink-0">' 
);

const tabs = [
  { path: '/admin', name: 'Dashboard' },
  { path: '/admin/blogs', name: 'Blog' },
  { path: '/admin/pages', name: 'Trang phụ' },
  { path: '/admin/projects', name: 'Dự án' },
  { path: '/admin/homepage', name: 'Trang chủ' },
  { path: '/admin/analytics', name: 'Analytics' },
  { path: '/admin/popup', name: 'Popup' }
];

tabs.forEach(tab => {
  const searchStr1 = `px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '${tab.path}' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`;
  const searchStr2 = `px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '${tab.path}' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`;
  const searchStr3 = `px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '${tab.path}' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'}`;
  const searchStr4 = `px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${pathname === '${tab.path}' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-500 hover:text-pink-400 hover:bg-pink-500/10'}`;

  const replaceStr = `text-sm transition-colors \${pathname === '${tab.path}' ? 'font-bold text-white' : 'font-medium text-zinc-500 hover:text-zinc-300'}`;

  content = content.replace(searchStr1, replaceStr);
  content = content.replace(searchStr2, replaceStr);
  content = content.replace(searchStr3, replaceStr);
  content = content.replace(searchStr4, replaceStr);
});

const oldLogout = `<button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>`;

const newLogout = `<button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 text-sm font-medium"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>`;

content = content.replace(oldLogout, newLogout);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed admin nav');
