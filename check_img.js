const fs = require('fs');
const stats = fs.statSync('/Users/macos/.gemini/antigravity/brain/0a87f8d0-a3ae-423d-8b80-46746cd2e130/.user_uploaded/media_1789714444243.png');
console.log('Size:', stats.size);
