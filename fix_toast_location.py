import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

# Replace the save button header
old_header = re.compile(r'<button \s*onClick=\{handleSave\}\s*disabled=\{saving\}\s*className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-lg font-bold hover:bg-white disabled:opacity-50"\s*>\s*\{saving \? "Đang lưu\.\.\." : "Lưu thay đổi"\}\s*</button>', re.DOTALL)
new_header = """<div className="flex items-center gap-4">
          {toast && (
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-right-5 fade-in duration-300 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-lg font-bold hover:bg-white disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>"""
content = old_header.sub(new_header, content)

# Remove the old toast at the bottom
old_toast = re.compile(r'\{toast && \(\s*<div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">.*?</svg>\s*\)\}\s*<span className="font-medium text-sm">\{toast\.message\}</span>\s*</div>\s*</div>\s*\)\}', re.DOTALL)
content = old_toast.sub('', content)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
