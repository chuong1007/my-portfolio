const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Change component name
content = content.replace(/export default function AdminPage\(\) \{/g, 'export default function ProjectsPage() {');

// We need to keep the state but we can just hardcode activeTab to 'projects' for the render.
// Or better, just let it be. But we want to remove the tab navigation menu.
// The tab navigation menu is probably inside a <div className="flex flex-wrap items-center gap-2 mb-8"> or similar.
// Let's replace the tab menu with a back button.
const tabMenuRegex = /<div className="flex flex-wrap items-center gap-2 mb-8">[\s\S]*?<\/div>/;
content = content.replace(tabMenuRegex, `
<div className="flex items-center gap-4 mb-8">
  <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors font-medium">
    <ChevronRight className="w-4 h-4 rotate-180" />
    Dashboard
  </Link>
  <h1 className="text-2xl font-bold text-white">Quản lý Dự án</h1>
</div>
`);

// Change the page title from "Admin | Chuong Graphic" to "Projects | Admin"
content = content.replace(/<title>Admin \| Chuong Graphic<\/title>/, '<title>Dự án | Admin</title>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Projects page modified');
