const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className={cn("about-subheading text-[var(--text-muted)] whitespace-nowrap [whitespace-nowrap" [&_p]_p]:m-0')) {
    lines[i] = '                    className={cn("about-subheading text-[var(--text-muted)] whitespace-nowrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}';
  } else if (lines[i].includes('className={cn("about-subheading text-[var(--text-muted)] whitespace-nowrap" [&_p]:m-0')) {
    lines[i] = '                    className={cn("about-subheading text-[var(--text-muted)] whitespace-nowrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}';
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
