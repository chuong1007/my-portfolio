const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/AdminModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const expandedBlocksUI = `
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Cột mở rộng (Kỹ năng, Học vấn, v.v)</label>
                    <button 
                      onClick={() => setData({ ...data, expandedBlocks: [...(data.expandedBlocks || []), { id: Date.now().toString(), type: 'half', content: '' }] })}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-emerald-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(data.expandedBlocks || []).map((block: any, i: number) => (
                      <div key={block.id || i} className="relative group p-4 border border-zinc-700/50 rounded-xl space-y-4">
                         <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                const updated = [...data.expandedBlocks];
                                updated.splice(i, 1);
                                setData({ ...data, expandedBlocks: updated });
                              }}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         
                         <div className="flex gap-2 mb-2">
                            <button onClick={() => { const u = [...data.expandedBlocks]; u[i].type = 'half'; setData({...data, expandedBlocks: u}) }} className={cn("px-3 py-1 text-xs rounded-lg transition-colors", block.type === 'half' ? "bg-blue-500 text-white font-medium" : "bg-zinc-800 text-zinc-400 hover:text-zinc-300")}>1 Cột (Half)</button>
                            <button onClick={() => { const u = [...data.expandedBlocks]; u[i].type = 'full'; setData({...data, expandedBlocks: u}) }} className={cn("px-3 py-1 text-xs rounded-lg transition-colors", block.type === 'full' ? "bg-blue-500 text-white font-medium" : "bg-zinc-800 text-zinc-400 hover:text-zinc-300")}>2 Cột (Full)</button>
                         </div>

                         <RichTextEditor
                            label={\`Cột \${i + 1}\`}
                            value={block.content}
                            onChange={(val) => {
                              const updated = [...data.expandedBlocks];
                              updated[i].content = typeof val.content === 'string' ? val.content : (val.content.desktop || '');
                              setData({ ...data, expandedBlocks: updated });
                            }}
                          />
                      </div>
                    ))}
                  </div>
                </div>
`;

content = content.replace(
  /\{\/\* Padding Top Slider for About \*\/\}/,
  expandedBlocksUI + '\n              {/* Padding Top Slider for About */}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added expandedBlocks UI to AdminModal');
