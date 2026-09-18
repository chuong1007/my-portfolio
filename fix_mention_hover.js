const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace hover state colors for better visibility in both modes
css = css.replace(/color: #60a5fa !important;/g, 'color: #3b82f6 !important;');
css = css.replace(/border-color: rgba\(59, 130, 246, 0.5\) !important;/g, 'border-color: #3b82f6 !important;');
css = css.replace(/background-color: rgba\(59, 130, 246, 0.05\) !important;/g, 'background-color: rgba(59, 130, 246, 0.1) !important;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Fixed mention hover colors');
