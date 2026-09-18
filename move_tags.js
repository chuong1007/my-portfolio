const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The block starts with:
// {/* Tags Management Integrated */}
// {!loading && activeTab === 'projects' && (
//   <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10 overflow-hidden">
//     <div className="flex items-center justify-between mb-6">
//       <h2 className="text-xl font-bold flex items-center gap-2">
//         <Tag className="w-5 h-5 text-emerald-400" />
//         Quản lý danh mục (Filter Tags)
//       </h2>

const startMarker = '{/* Tags Management Integrated */}';
const startIdx = content.indexOf(startMarker);

// Find the end of this block. It ends with:
//         </Reorder.Group>
//       </div>
//     </div>
//   </div>
// )}

let endIdx = -1;
if (startIdx !== -1) {
    const endMarker = `        </Reorder.Group>
             </div>
          </div>
        </div>
      )}`;
    const endMarkerIdx = content.indexOf(endMarker, startIdx);
    if (endMarkerIdx !== -1) {
        endIdx = endMarkerIdx + endMarker.length;
    } else {
        // Just search for the end of the block manually
        const searchStr = '      )}\n\n      {/* Empty State */}';
        const searchIdx = content.indexOf(searchStr, startIdx);
        if (searchIdx !== -1) {
            endIdx = searchIdx + '      )}\n'.length;
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    // Extract the block
    const block = content.substring(startIdx, endIdx);
    
    // Remove the block from its current position
    content = content.substring(0, startIdx) + content.substring(endIdx);
    
    // Find the end of the project list to insert it
    // The project list ends at:
    //       </div>
    //     )}
    //   </div>
    // </main>
    
    const insertMarker = '    </div>\n  );\n}';
    const insertIdx = content.lastIndexOf(insertMarker);
    
    if (insertIdx !== -1) {
        // Insert right before the closing div of the main container
        content = content.substring(0, insertIdx) + '\n      ' + block + '\n\n' + content.substring(insertIdx);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Moved tags to the bottom');
    } else {
        console.log('Could not find insert position');
    }
} else {
    console.log('Could not find tags block', startIdx, endIdx);
}
