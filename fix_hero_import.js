const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetImport = 'import { SectionEditor } from "@/components/SectionEditor";';
const newImport = 'import { SectionEditor } from "@/components/SectionEditor";\nimport { HeroAnimatedTitle } from "./HeroAnimatedTitle";';

if (content.includes(targetImport)) {
  content = content.replace(targetImport, newImport);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added import!');
} else {
  console.log('Could not find target import.');
}
