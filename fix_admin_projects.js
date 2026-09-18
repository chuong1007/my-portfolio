const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
if (!fs.existsSync(filePath)) {
    console.log('File does not exist!');
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// I need to remove the tab menu from the projects page and just show the projects.
// Let's replace the tab menu container with a back button.
// The tab menu looks like this:
/*
<div className="flex flex-wrap items-center gap-2 mb-8">
  <button ... onClick={() => setActiveTab('dashboard')}>
  ...
  <button ... onClick={() => setActiveTab('popup')}>
  ...
</div>
*/

// Let's use a simpler regex or split to replace the tab menu.
// We can find `<div className="flex flex-wrap items-center gap-2 mb-8">` and the matching closing `</div>`.
const startIndex = content.indexOf('<div className="flex flex-wrap items-center gap-2 mb-8">');
if (startIndex !== -1) {
    // find the matching closing div
    let openDivs = 0;
    let endIndex = -1;
    let i = startIndex;
    while (i < content.length) {
        if (content.substring(i, i + 4) === '<div') openDivs++;
        if (content.substring(i, i + 6) === '</div') {
            openDivs--;
            if (openDivs === 0) {
                endIndex = i + 6;
                break;
            }
        }
        i++;
    }

    if (endIndex !== -1) {
        const replacement = `
        <div className="flex flex-wrap items-center justify-between mb-8">
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
        </div>
        `;
        content = content.substring(0, startIndex) + replacement + content.substring(endIndex + 1);
    }
}

// Remove the standalone "Thêm dự án mới" button since we moved it up
const standaloneButtonRegex = /\{activeTab === 'projects' && \(\s*<button\s*onClick=\{\(\) => setShowProjectForm\(true\)\}\s*className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-5 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-fit"\s*>\s*<Plus className="w-5 h-5" \/>\s*Thêm dự án mới\s*<\/button>\s*\)\}/g;
content = content.replace(standaloneButtonRegex, '');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed projects page tab menu');
