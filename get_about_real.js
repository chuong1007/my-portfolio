const fs = require('fs');
const files = [
  '/Users/macos/Desktop/my-portfolio/backup/database/site_content.json',
  '/Users/macos/Desktop/my-portfolio/backups/latest_site_content.json',
  '/Users/macos/Desktop/my-portfolio/backups/inc_2026-03-22T08-04-46-355Z/site_content.json',
  '/Users/macos/Desktop/my-portfolio/backups/2026-03-20T15-48-53-009Z/site_content.json'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const about = data.find(d => d.section_id === 'about' || d.id === 'about');
      if (about) {
        console.log('--- FOUND IN', file);
        console.log(JSON.stringify(about, null, 2));
      }
    } catch(e) {}
  }
}
