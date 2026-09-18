const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('useEffect(() => {\n    const hasCorrectTitle');
if (startIndex !== -1) {
  const endIndex = content.indexOf('  }, [expandedBlocks]);\n', startIndex);
  if (endIndex !== -1) {
    const toRemove = content.substring(startIndex, endIndex + '  }, [expandedBlocks]);\n'.length);
    content = content.replace(toRemove, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully removed fallback from About.tsx');
  } else {
    console.log('Could not find end of useEffect');
  }
} else {
  console.log('Could not find start of useEffect');
}
