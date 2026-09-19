import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

# 1. Add state for toast
content = content.replace(
    'const [uploading, setUploading] = useState(false);',
    'const [uploading, setUploading] = useState(false);\n  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);\n\n  const showToast = (message: string, type: "success" | "error" = "success") => {\n    setToast({ message, type });\n    setTimeout(() => setToast(null), 3000);\n  };'
)

# 2. Replace alert calls
content = content.replace('alert("Đã lưu thành công!");', 'showToast("Đã lưu thành công!", "success");')
content = content.replace('alert("Lỗi: " + e.message);', 'showToast("Lỗi: " + e.message, "error");')
content = content.replace('alert("Lỗi upload: " + error.message);', 'showToast("Lỗi upload: " + error.message, "error");')

# 3. Add Toast UI to rendering (at the end of the main container, before the final </div>)
# We need to find the final </div>. Let's append it right before the last closing tag.
# Actually, we can add it as a fixed element inside the main return block.

toast_ui = """
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
"""

content = content.replace('    </div>\n  );\n}\n', f'{toast_ui}    </div>\n  );\n}}\n')

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
print("Added Toast to Admin Carousel")
