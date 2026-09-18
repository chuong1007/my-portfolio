const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Contact Heading
content = content.replace(
  /<input\s+type="text"\s+value=\{contactData\.heading\}\s+onChange=\{\(e\) => setContactData\(\{ \.\.\.contactData, heading: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"\s+\/>/,
  `<RichTextEditor
                  content={contactData.heading}
                  onChange={(content: string) => setContactData({ ...contactData, heading: content })}
                  className="bg-zinc-800 border-zinc-700"
                  editable={true}
                />`
);

// Replace Contact Subtitle
content = content.replace(
  /<input\s+type="text"\s+value=\{contactData\.subtitle\}\s+onChange=\{\(e\) => setContactData\(\{ \.\.\.contactData, subtitle: e\.target\.value \}\)\}\s+className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-500"\s+\/>/,
  `<RichTextEditor
                  content={contactData.subtitle}
                  onChange={(content: string) => setContactData({ ...contactData, subtitle: content })}
                  className="bg-zinc-800 border-zinc-700"
                  editable={true}
                />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Contact inputs');
