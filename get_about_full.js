const fs = require('fs');
const files = [
  '/Users/macos/Desktop/my-portfolio/backup/database/site_content.json',
  '/Users/macos/Desktop/my-portfolio/backups/latest_site_content.json',
  '/Users/macos/Desktop/my-portfolio/backups/2026-03-20T15-48-53-009Z/site_content.json'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const about = data.find(d => d.section_id === 'about');
    if (about) {
      console.log('Found about in', file);
      console.log(JSON.stringify(about.data, null, 2));
      break;
    }
  }
}
