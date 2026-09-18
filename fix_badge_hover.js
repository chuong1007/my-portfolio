const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace the mention hover styles
const oldHover = /\.mention:hover,\n\[data-type="mention"\]:hover\s*{[^}]+}/;
const newHover = `.mention:hover,
[data-type="mention"]:hover {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: #ffffff !important;
  box-shadow: none !important;
}`;

if (oldHover.test(css)) {
  css = css.replace(oldHover, newHover);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated mention hover styles.');
} else {
  console.log('Could not find mention hover styles.');
}
