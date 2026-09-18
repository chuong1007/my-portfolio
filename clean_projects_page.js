const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/projects/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace conditional renders so they always render projects and never render others
// We'll just force the render
content = content.replace(/\{activeTab === 'dashboard' && !loading && \([\s\S]*?\}\)/g, '');
content = content.replace(/\{activeTab === 'projects' && \(/g, '{true && (');
content = content.replace(/\{activeTab === 'homepage' && \([\s\S]*?\}\)/g, '');
content = content.replace(/\{activeTab === 'analytics' && \([\s\S]*?\}\)/g, '');
content = content.replace(/\{activeTab === 'popup' && \([\s\S]*?\}\)/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned projects page renders');
