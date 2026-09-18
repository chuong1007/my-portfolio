const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/GlobalPreviewWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add lucide imports
if (!content.includes('import { Edit2, Eye, Monitor, Smartphone, Tablet } from "lucide-react"')) {
  content = content.replace(
    /import { AdminModal } from "@\/components\/AdminModal";/,
    `import { AdminModal } from "@/components/AdminModal";\nimport { Edit2, Eye, Monitor, Smartphone, Tablet } from "lucide-react";`
  );
}

// 2. Update useAdmin destructured variables
content = content.replace(
  /const \{ globalPreviewMode, isAdmin, modalState, closeEditor \} = useAdmin\(\);/,
  `const { globalPreviewMode, setGlobalPreviewMode, isAdmin, isEditMode, toggleEditMode, modalState, closeEditor } = useAdmin();`
);

// 3. Add the floating controls inside the isPreviewActive block
const floatingControls = `
          {/* Floating Admin Controls OUTSIDE the simulator frame */}
          <div className="fixed top-6 left-6 md:left-[calc(50%+220px)] lg:left-[calc(50%+240px)] xl:left-[calc(50%+300px)] z-[2000] flex flex-col items-start gap-4" style={{ transform: "translateX(20px)" }}>
            
            {/* Admin Mode Toggle */}
            <button
              onClick={() => toggleEditMode()}
              className={cn(
                "flex items-center justify-center gap-3 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border",
                isEditMode
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)] hover:text-[var(--text-primary)]"
              )}
            >
              {isEditMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditMode ? "Admin Mode: ON" : "Edit Mode: OFF"}
            </button>
            
            {/* Device Toggle */}
            <div className="flex bg-[var(--bg-elevated)] rounded-full border border-[var(--border-default)] p-1 shadow-lg shadow-black/50">
              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setGlobalPreviewMode(mode)}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200",
                    globalPreviewMode === mode
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                  title={mode}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            
          </div>
`;

content = content.replace(
  /<div className="absolute inset-0 bg-\[var\(--bg-base\)\]" \/>/,
  `<div className="absolute inset-0 bg-[var(--bg-base)]" />\n${floatingControls}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed GlobalPreviewWrapper');
