with open('src/components/ProjectDetail.tsx', 'r') as f:
    content = f.read()

old_effect = """
  // Force scroll to top on mount / project change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [project.id]);
"""

new_effect = """
  // Force scroll to top on mount / project change
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we are inside the admin preview container
      const customScrollbar = document.querySelector('.custom-scrollbar');
      if (customScrollbar) {
        customScrollbar.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [project.id]);
"""

content = content.replace(old_effect.strip(), new_effect.strip())

with open('src/components/ProjectDetail.tsx', 'w') as f:
    f.write(content)
