const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Hero Title
content = content.replace(
  /<textarea\s+value=\{heroData\.title\}\s+onChange=\{\(e\) => setHeroData\(\{ \.\.\.heroData, title: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"\s+rows=\{2\}\s+\/>/,
  `<RichTextEditor
                content={heroData.title}
                onChange={(content: string) => setHeroData({ ...heroData, title: content })}
                className="bg-zinc-800 border-zinc-700"
                editable={true}
              />`
);

// Replace Hero Subtitle
content = content.replace(
  /<input\s+type="text"\s+value=\{heroData\.subtitle\}\s+onChange=\{\(e\) => setHeroData\(\{ \.\.\.heroData, subtitle: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"\s+\/>/,
  `<RichTextEditor
                content={heroData.subtitle}
                onChange={(content: string) => setHeroData({ ...heroData, subtitle: content })}
                className="bg-zinc-800 border-zinc-700"
                editable={true}
              />`
);

// Replace About Heading
content = content.replace(
  /<input\s+type="text"\s+value=\{aboutData\.heading\}\s+onChange=\{\(e\) => setAboutData\(\{ \.\.\.aboutData, heading: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"\s+\/>/,
  `<RichTextEditor
                content={aboutData.heading}
                onChange={(content: string) => setAboutData({ ...aboutData, heading: content })}
                className="bg-zinc-800 border-zinc-700"
                editable={true}
              />`
);

// Replace About Subheading
content = content.replace(
  /<input\s+type="text"\s+value=\{aboutData\.subheading\}\s+onChange=\{\(e\) => setAboutData\(\{ \.\.\.aboutData, subheading: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"\s+\/>/,
  `<RichTextEditor
                content={aboutData.subheading}
                onChange={(content: string) => setAboutData({ ...aboutData, subheading: content })}
                className="bg-zinc-800 border-zinc-700"
                editable={true}
              />`
);

// Replace About Paragraphs
content = content.replace(
  /<textarea\s+value=\{p\}\s+onChange=\{\(e\) => \{\s+const updated = \[\.\.\.aboutData\.paragraphs\];\s+updated\[idx\] = e\.target\.value;\s+setAboutData\(\{ \.\.\.aboutData, paragraphs: updated \}\);\s+\}\}\s+className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"\s+rows=\{3\}\s+\/>/,
  `<div className="flex-1">
                      <RichTextEditor
                        content={p}
                        onChange={(content: string) => {
                          const updated = [...aboutData.paragraphs];
                          updated[idx] = content;
                          setAboutData({ ...aboutData, paragraphs: updated });
                        }}
                        className="bg-zinc-800 border-zinc-700"
                        editable={true}
                      />
                    </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced textareas with RichTextEditor');
