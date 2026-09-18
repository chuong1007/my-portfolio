const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the header section to replace
// It starts with `<h1 className="text-3xl font-bold">Trang Quản Trị</h1>`
// and ends after the `</div>` that closes the tab menu.

// We will use a regex to match from `<div className="flex items-center justify-between mb-8">`
// Wait, my previous script added a hidden div and some other stuff.
// Let's just find the start of the `max-w-6xl` container and replace its first children.

const regex = /<h1 className="text-3xl font-bold">Trang Quản Trị<\/h1>[\s\S]*?<div className="w-px h-4 bg-zinc-800 mx-1" \/>[\s\S]*?<\/div>/;
content = content.replace(regex, '');

// Actually, in the previous script I tried to add a back button. Let's see if it's there.
// If it is there, I just need to remove the "Trang Quản Trị" and the tab menu.
// Let's just replace the exact block.

// Instead of regex, let's use string manipulation to be perfectly safe.
const strToReplace = `<h1 className="text-3xl font-bold">Trang Quản Trị</h1>`;
if (content.includes(strToReplace)) {
    // Find the index of this string
    const h1Index = content.indexOf(strToReplace);
    // Find the next `</div>` after the tab menu.
    // The tab menu is `<div className="flex items-center gap-2 mt-2 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">`
    const tabDivStart = content.indexOf('<div className="flex items-center gap-2 mt-2 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">', h1Index);
    if (tabDivStart !== -1) {
        let openDivs = 0;
        let endIndex = -1;
        let i = tabDivStart;
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
            // Remove it!
            content = content.substring(0, h1Index) + content.substring(endIndex);
        }
    }
}

// Ensure the back button is there
if (!content.includes('Quản lý Dự án')) {
    // It's missing. Add it right after `<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">`
    const containerStr = '<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">';
    const headerHtml = `
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors font-medium">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Quản lý Dự án</h1>
        </div>
      </div>
    `;
    content = content.replace(containerStr, containerStr + headerHtml);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed tabs from projects page');
