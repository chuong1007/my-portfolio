const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/builder/RichTextEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('export type RichTextData')) {
  const typeDef = `
export type RichTextData = {
  content: string;
  fontSize?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  lineHeight?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  fontFamily?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  fontWeight?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
};
`;

  content = typeDef + '\\n' + content;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added RichTextData to builder/RichTextEditor.tsx');
}
