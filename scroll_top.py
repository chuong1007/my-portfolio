import re

with open('src/components/ProjectDetail.tsx', 'r') as f:
    content = f.read()

# Add a useEffect to scroll to top when project.id changes
scroll_effect = """
  // Force scroll to top on mount / project change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [project.id]);
"""

# Find a good place to insert it. e.g., right after "const { isAdmin, globalPreviewMode } = useAdmin();"
content = content.replace('const { isAdmin, globalPreviewMode } = useAdmin();', 'const { isAdmin, globalPreviewMode } = useAdmin();\n' + scroll_effect)

with open('src/components/ProjectDetail.tsx', 'w') as f:
    f.write(content)
