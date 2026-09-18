const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Change export default function AdminPage() to ProjectsPage()
content = content.replace(/export default function AdminPage\(\) \{/g, 'export default function ProjectsPage() {');

// Change title
content = content.replace(/<title>Admin \| Chuong Graphic<\/title>/, '<title>Dự án | Admin</title>');

// Hide the tab menu by adding hidden to the container
content = content.replace(/<div className="flex flex-wrap items-center gap-2 mb-8">/g, '<div className="hidden">');

// Add a back button header just above where the tab menu was (the tab menu is inside <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">)
// The container is: <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
content = content.replace(
  /<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">/,
  `<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors font-medium">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Quản lý Dự án</h1>
        </div>
        <button
          onClick={() => setShowProjectForm(true)}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Thêm dự án mới
        </button>
      </div>`
);

// We need to remove the other "Thêm dự án mới" button because we moved it to the header
const standaloneButtonRegex = /\{activeTab === 'projects' && \(\s*<button\s*onClick=\{\(\) => setShowProjectForm\(true\)\}\s*className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"\s*>\s*<Plus className="w-5 h-5" \/>\s*Thêm dự án mới\s*<\/button>\s*\)\}/g;
content = content.replace(standaloneButtonRegex, '');

// Since this is the projects page, we want activeTab to always be 'projects' on first render.
// In the useState: const [activeTab, setActiveTab] = useState<'projects' | 'homepage' | 'analytics' | 'popup'>...
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<'projects' \| 'homepage' \| 'analytics' \| 'popup'>\([^)]+\);/s,
  `const [activeTab, setActiveTab] = useState<'projects' | 'homepage' | 'analytics' | 'popup'>('projects');`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed tabs safely');
