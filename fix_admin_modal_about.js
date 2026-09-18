const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/AdminModal.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const newLines = [];
let skip = false;
let replaced = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Cột mở rộng (Kỹ năng, Học vấn, v.v)')) {
    skip = true;
    
    // Walk back 2 lines to remove the wrapper div
    newLines.pop();
    newLines.pop();
    
    const newUI = `
              {/* CỘT MỞ RỘNG */}
              <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 mt-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                  <ExternalLink className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-[var(--text-primary)] font-semibold">Cột mở rộng (Kỹ năng, Học vấn)</h3>
                <p className="text-[var(--text-muted)] text-sm max-w-sm">
                  Khu vực này có nhiều nội dung và đã có một không gian rộng rãi để chỉnh sửa riêng biệt.
                </p>
                <a 
                  href="/admin/about"
                  target="_blank"
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  Mở trang chỉnh sửa
                </a>
              </div>
    `;
    newLines.push(newUI);
    replaced = true;
  }
  
  if (skip && lines[i].includes('{/* Padding Top Slider for About */}')) {
    skip = false;
  }
  
  if (!skip) {
    newLines.push(lines[i]);
  }
}

if (replaced) {
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log('Replaced AdminModal.tsx about expanded blocks successfully!');
} else {
  console.log('Could not find Cột mở rộng in AdminModal.tsx');
}

