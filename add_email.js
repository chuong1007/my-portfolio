const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldLogout = `<button
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

const newLogout = `<span className="text-sm text-zinc-500 font-medium hidden md:block">{user.email}</span>
            <button
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
console.log('Added email');
