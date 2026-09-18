const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Gallery.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .gallery-title:not(.is-editor) {
          font-size: var(--g-fs-mob);
          line-height: var(--g-lh-mob);
          font-family: var(--g-ff-mob);
          font-weight: var(--g-fw-mob);
        }
        .gallery-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          padding-bottom: var(--pb-mob);
        }
        @media (min-width: 768px) {
          .gallery-title:not(.is-editor) {
            font-size: var(--g-fs-tab);
            line-height: var(--g-lh-tab);
            font-family: var(--g-ff-tab);
            font-weight: var(--g-fw-tab);
          }
          .gallery-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            padding-bottom: var(--pb-tab);
          }
        }
        @media (min-width: 1024px) {
          .gallery-title:not(.is-editor) {
            font-size: var(--g-fs-desk);
            line-height: var(--g-lh-desk);
            font-family: var(--g-ff-desk);
            font-weight: var(--g-fw-desk);
          }
          .gallery-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            padding-bottom: var(--pb-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section\s+id="projects"/,
  `${styleBlock}\n      <section id="projects"`
);

// Add gallery-container class and remove arbitrary pt/pb
content = content.replace(
  /!isEditor && variant !== 'homepage' && "pt-\[var\(--pt-mob\)\] md:pt-\[var\(--pt-tab\)\] lg:pt-\[var\(--pt-desk\)\]",\n\s*!isEditor && "pb-\[var\(--pb-mob\)\] md:pb-\[var\(--pb-tab\)\] lg:pb-\[var\(--pb-desk\)\]"/,
  `!isEditor && variant !== 'homepage' && "gallery-container not-is-editor",
          isEditor && "is-editor"`
);

// Fix title classes
content = content.replace(
  /!isEditor && "text-\[length:var\(--g-fs-mob\)\] md:text-\[length:var\(--g-fs-tab\)\] lg:text-\[length:var\(--g-fs-desk\)\] leading-\[var\(--g-lh-mob\)\] md:leading-\[var\(--g-lh-tab\)\] lg:leading-\[var\(--g-lh-desk\)\] \[font-family:var\(--g-ff-mob\)\] md:\[font-family:var\(--ff-tab\)\] lg:\[font-family:var\(--g-ff-desk\)\] font-\[var\(--g-fw-mob\)\] md:font-\[var\(--g-fw-tab\)\] lg:font-\[var\(--g-fw-desk\)\]"/,
  `!isEditor && "gallery-title not-is-editor", isEditor && "is-editor"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done Gallery.tsx');
