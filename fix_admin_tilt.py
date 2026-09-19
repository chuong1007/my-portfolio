import re

with open('src/app/admin/carousel/page.tsx', 'r') as f:
    content = f.read()

# Add tiltDirection state
content = content.replace(
    'const [images, setImages] = useState<CarouselImage[]>([]);',
    'const [images, setImages] = useState<CarouselImage[]>([]);\n  const [tiltDirection, setTiltDirection] = useState<"inward" | "outward">("inward");'
)

# Update fetchImages
old_fetch = """      const { data, error } = await createClient()
        .from("site_content")
        .select("data")
        .eq("id", "hero_carousel")
        .single();
        
      if (data?.data?.images) {
        setImages(data.data.images);
      }"""
new_fetch = """      const { data, error } = await createClient()
        .from("site_content")
        .select("data")
        .eq("id", "hero_carousel")
        .single();
        
      if (data?.data?.images) {
        setImages(data.data.images);
      }
      if (data?.data?.tiltDirection) {
        setTiltDirection(data.data.tiltDirection);
      }"""
content = content.replace(old_fetch, new_fetch)

# Update save logic
content = content.replace(
    '.upsert({ id: "hero_carousel", data: { images } });',
    '.upsert({ id: "hero_carousel", data: { images, tiltDirection } });'
)

# Render tilt direction toggle button
# Let's find a good place. Next to Device Toggle
old_preview_controls = """              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon }) => ("""

new_preview_controls = """              <button
                onClick={() => setTiltDirection(prev => prev === 'inward' ? 'outward' : 'inward')}
                className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-medium mr-4 hover:bg-[var(--bg-surface)] transition-colors"
              >
                Góc nghiêng: {tiltDirection === 'inward' ? 'Hướng vào (Inward)' : 'Hướng ra (Outward)'}
              </button>
              {([
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon }) => ("""
content = content.replace(old_preview_controls, new_preview_controls)

# Update HeroIntroCarousel rendering in admin preview to pass tiltDirection
content = content.replace(
    'isAdminPreview={true} deviceMode={previewMode}',
    'isAdminPreview={true} deviceMode={previewMode} tiltDirection={tiltDirection}'
)

with open('src/app/admin/carousel/page.tsx', 'w') as f:
    f.write(content)
print("Admin carousel page updated")
