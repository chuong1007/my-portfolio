const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/GlobalPreviewWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to import lucide icons in GlobalPreviewWrapper
if (!content.includes('import { Edit2, Eye, Monitor, Smartphone, Tablet } from "lucide-react"')) {
  content = content.replace(
    /import { AdminModal } from "@\/components\/AdminModal";/,
    `import { AdminModal } from "@/components/AdminModal";\nimport { Edit2, Eye, Monitor, Smartphone, Tablet } from "lucide-react";`
  );
}

// Add the floating controls outside the device frame
const floatingControls = `
          {/* Floating Admin Controls OUTSIDE the simulator frame */}
          <div className="fixed top-6 left-6 z-[2000] flex flex-col items-start gap-4">
            {/* Device Toggle */}
            <div className="flex bg-[var(--bg-elevated)] rounded-full border border-[var(--border-default)] p-1 shadow-lg shadow-black/50">
              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => {
                    useAdmin.getState?.().setGlobalPreviewMode?.(mode);
                    // Or we just call window event if we can't get setGlobalPreviewMode
                  }}
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
            
            {/* Admin Mode Toggle */}
            <button
              onClick={() => {
                // toggle
              }}
              className="flex items-center justify-center gap-3 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all border bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
            >
              <Edit2 className="w-4 h-4" />
              Admin Mode: ON
            </button>
          </div>
`;

// Let's first check if we have setGlobalPreviewMode in useAdmin
// wait, we can just extract it from useAdmin in GlobalPreviewWrapper!
