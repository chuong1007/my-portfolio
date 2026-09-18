const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Blog.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .blog-title:not(.is-editor) {
          font-size: var(--b-fs-mob);
          line-height: var(--b-lh-mob);
          font-family: var(--b-ff-mob);
          font-weight: var(--b-fw-mob);
        }
        .blog-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          padding-bottom: var(--pb-mob);
        }
        @media (min-width: 768px) {
          .blog-title:not(.is-editor) {
            font-size: var(--b-fs-tab);
            line-height: var(--b-lh-tab);
            font-family: var(--b-ff-tab);
            font-weight: var(--b-fw-tab);
          }
          .blog-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            padding-bottom: var(--pb-tab);
          }
        }
        @media (min-width: 1024px) {
          .blog-title:not(.is-editor) {
            font-size: var(--b-fs-desk);
            line-height: var(--b-lh-desk);
            font-family: var(--b-ff-desk);
            font-weight: var(--b-fw-desk);
          }
          .blog-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            padding-bottom: var(--pb-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section\s+id=\{sectionId\}/,
  `${styleBlock}\n      <section id={sectionId}`
);

// Add blog-container class and fix px padding for simulator
content = content.replace(
  /"px-4 md:px-12 bg-\[var\(--bg-base\)\] relative",\n\s*!isEditor && "pt-\[var\(--pt-mob\)\] md:pt-\[var\(--pt-tab\)\] lg:pt-\[var\(--pt-desk\)\]",\n\s*!isEditor && "pb-\[var\(--pb-mob\)\] md:pb-\[var\(--pb-tab\)\] lg:pb-\[var\(--pb-desk\)\]"/,
  `"bg-[var(--bg-base)] relative",
          !isEditor && "px-4 md:px-12",
          isEditor && globalPreviewMode === 'mobile' && "px-4",
          isEditor && globalPreviewMode === 'tablet' && "px-8",
          isEditor && globalPreviewMode === 'desktop' && "px-12",
          !isEditor && "blog-container not-is-editor",
          isEditor && "is-editor"`
);

// Fix title classes
content = content.replace(
  /!isEditor && "text-\[length:var\(--b-fs-mob\)\] md:text-\[length:var\(--b-fs-tab\)\] lg:text-\[length:var\(--b-fs-desk\)\] leading-\[var\(--b-lh-mob\)\] md:leading-\[var\(--b-lh-tab\)\] lg:leading-\[var\(--b-lh-desk\)\] \[font-family:var\(--b-ff-mob\)\] md:\[font-family:var\(--ff-tab\)\] lg:\[font-family:var\(--b-ff-desk\)\] font-\[var\(--b-fw-mob\)\] md:font-\[var\(--b-fw-tab\)\] lg:font-\[var\(--b-fw-desk\)\]"/,
  `!isEditor && "blog-title not-is-editor", isEditor && "is-editor"`
);

// We should also check grid layout if any!
content = content.replace(
  /className="grid gap-6 md:gap-8 lg:gap-10 mt-8"/,
  `className={cn("grid gap-6 md:gap-8 lg:gap-10 mt-8", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done Blog.tsx');
