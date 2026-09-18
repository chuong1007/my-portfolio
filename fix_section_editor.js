const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/SectionEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the about section redirect
const blockToRemove = `    // Nếu là các trang đã có menu riêng bên trái, chuyển hướng luôn tới đó
    if (sectionId === 'about') {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'NAVIGATE_TO', url: '/admin/about' }, '*');
      } else {
        window.location.href = '/admin/about';
      }
      return;
    }`;

content = content.replace(blockToRemove, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed SectionEditor');
