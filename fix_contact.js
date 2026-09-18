const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Contact.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add <style> block for Contact
const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .contact-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          padding-bottom: var(--pb-mob);
          padding-left: 16px;
          padding-right: 16px;
        }
        .contact-heading:not(.is-editor) {
          font-size: var(--h-fs-mob);
          line-height: var(--h-lh-mob);
          font-family: var(--h-ff-mob);
          font-weight: var(--h-fw-mob);
        }
        .contact-subheading:not(.is-editor) {
          font-size: var(--s-fs-mob);
          line-height: var(--s-lh-mob);
        }
        .contact-grid:not(.is-editor) {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        @media (min-width: 768px) {
          .contact-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            padding-bottom: var(--pb-tab);
            padding-left: 48px;
            padding-right: 48px;
          }
          .contact-heading:not(.is-editor) {
            font-size: var(--h-fs-tab);
            line-height: var(--h-lh-tab);
            font-family: var(--h-ff-tab);
            font-weight: var(--h-fw-tab);
          }
          .contact-subheading:not(.is-editor) {
            font-size: var(--s-fs-tab);
            line-height: var(--s-lh-tab);
          }
          .contact-grid:not(.is-editor) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .contact-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            padding-bottom: var(--pb-desk);
          }
          .contact-heading:not(.is-editor) {
            font-size: var(--h-fs-desk);
            line-height: var(--h-lh-desk);
            font-family: var(--h-ff-desk);
            font-weight: var(--h-fw-desk);
          }
          .contact-subheading:not(.is-editor) {
            font-size: var(--s-fs-desk);
            line-height: var(--s-lh-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section\s+id="contact"/,
  `${styleBlock}\n      <section id="contact"`
);

// Container classes
content = content.replace(
  /className=\{cn\(\n\s*"px-4 md:px-12 bg-\[var\(--bg-base\)\] pt-\[var\(--pt-mob\)\] md:pt-\[var\(--pt-tab\)\] lg:pt-\[var\(--pt-desk\)\] pb-\[var\(--pb-mob\)\] md:pb-\[var\(--pb-tab\)\] lg:pb-\[var\(--pb-desk\)\]",/,
  `className={cn(
          "contact-container bg-[var(--bg-base)]",
          !isEditor && "not-is-editor",
          isEditor && "is-editor",
          isEditor && globalPreviewMode === 'mobile' && "px-4",
          isEditor && globalPreviewMode === 'tablet' && "px-8",
          isEditor && globalPreviewMode === 'desktop' && "px-12",`
);

// Grid layout classes
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full mt-4"/,
  `className={cn("contact-grid w-full mt-4 gap-4 md:gap-8 grid", !isEditor && "not-is-editor", isEditor && "is-editor", isEditor && globalPreviewMode !== 'desktop' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}`
);

// Heading classes
content = content.replace(
  /className="tracking-tighter text-\[var\(--text-primary\)\] whitespace-pre-wrap transition-all duration-300 \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] \[\&_h1\]:m-0 \[\&_h2\]:m-0 \[\&_h3\]:m-0 text-\[length:var\(--h-fs-mob\)\] md:text-\[length:var\(--h-fs-tab\)\] lg:text-\[length:var\(--h-fs-desk\)\] leading-\[var\(--h-lh-mob\)\] md:leading-\[var\(--h-lh-tab\)\] lg:leading-\[var\(--h-lh-desk\)\] \[font-family:var\(--h-ff-mob\)\] md:\[font-family:var\(--h-ff-tab\)\] lg:\[font-family:var\(--h-ff-desk\)\] font-\[var\(--h-fw-mob\)\] md:font-\[var\(--h-fw-tab\)\] lg:font-\[var\(--h-fw-desk\)\]"/,
  `className={cn("contact-heading tracking-tighter text-[var(--text-primary)] whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

// Subheading classes
content = content.replace(
  /className="text-\[var\(--text-muted\)\] whitespace-pre-wrap transition-all duration-300 \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] \[\&_h1\]:m-0 \[\&_h2\]:m-0 \[\&_h3\]:m-0 text-\[length:var\(--s-fs-mob\)\] md:text-\[length:var\(--s-fs-tab\)\] lg:text-\[length:var\(--s-fs-desk\)\] leading-\[var\(--s-lh-mob\)\] md:leading-\[var\(--s-lh-tab\)\] lg:leading-\[var\(--s-lh-desk\)\]"/,
  `className={cn("contact-subheading text-[var(--text-muted)] whitespace-pre-wrap transition-all duration-300 [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

// Heading styles
content = content.replace(
  /style=\{\{\s*"--h-fs-desk": \`\$\{heading\.fontSize\?\.desktop \|\| 80\}px\`,\s*"--h-fs-tab": \`\$\{heading\.fontSize\?\.tablet \|\| 48\}px\`,\s*"--h-fs-mob": \`\$\{heading\.fontSize\?\.mobile \|\| 32\}px\`,\s*"--h-lh-desk": heading\.lineHeight\?\.desktop \|\| '1\.1',\s*"--h-lh-tab": heading\.lineHeight\?\.tablet \|\| '1\.1',\s*"--h-lh-mob": heading\.lineHeight\?\.mobile \|\| '1\.1',\s*"--h-ff-desk": heading\.fontFamily\?\.desktop \|\| 'inherit',\s*"--h-ff-tab": heading\.fontFamily\?\.tablet \|\| 'inherit',\s*"--h-ff-mob": heading\.fontFamily\?\.mobile \|\| 'inherit',\s*"--h-fw-desk": heading\.fontWeight\?\.desktop \|\| '700',\s*"--h-fw-tab": heading\.fontWeight\?\.tablet \|\| '700',\s*"--h-fw-mob": heading\.fontWeight\?\.mobile \|\| '700',\s*\} as any\}/,
  `style={{
                    fontSize: isEditor ? \`\${heading.fontSize?.[globalPreviewMode || 'desktop'] || 80}px\` : undefined,
                    lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                    fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                    fontWeight: isEditor ? (heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                    "--h-fs-desk": \`\${heading.fontSize?.desktop || 80}px\`,
                    "--h-fs-tab": \`\${heading.fontSize?.tablet || 48}px\`,
                    "--h-fs-mob": \`\${heading.fontSize?.mobile || 32}px\`,
                    "--h-lh-desk": heading.lineHeight?.desktop || '1.1',
                    "--h-lh-tab": heading.lineHeight?.tablet || '1.1',
                    "--h-lh-mob": heading.lineHeight?.mobile || '1.1',
                    "--h-ff-desk": heading.fontFamily?.desktop || 'inherit',
                    "--h-ff-tab": heading.fontFamily?.tablet || 'inherit',
                    "--h-ff-mob": heading.fontFamily?.mobile || 'inherit',
                    "--h-fw-desk": heading.fontWeight?.desktop || '700',
                    "--h-fw-tab": heading.fontWeight?.tablet || '700',
                    "--h-fw-mob": heading.fontWeight?.mobile || '700',
                  } as React.CSSProperties}`
);

// Subheading styles
content = content.replace(
  /style=\{\{\s*"--s-fs-desk": \`\$\{subtitle\.fontSize\?\.desktop \|\| 24\}px\`,\s*"--s-fs-tab": \`\$\{subtitle\.fontSize\?\.tablet \|\| 20\}px\`,\s*"--s-fs-mob": \`\$\{subtitle\.fontSize\?\.mobile \|\| 18\}px\`,\s*"--s-lh-desk": subtitle\.lineHeight\?\.desktop \|\| '1\.4',\s*"--s-lh-tab": subtitle\.lineHeight\?\.tablet \|\| '1\.4',\s*"--s-lh-mob": subtitle\.lineHeight\?\.mobile \|\| '1\.4',\s*\} as any\}/,
  `style={{
                    fontSize: isEditor ? \`\${subtitle.fontSize?.[globalPreviewMode || 'desktop'] || 24}px\` : undefined,
                    lineHeight: isEditor ? (subtitle.lineHeight?.[globalPreviewMode || 'desktop'] || '1.4') : undefined,
                    "--s-fs-desk": \`\${subtitle.fontSize?.desktop || 24}px\`,
                    "--s-fs-tab": \`\${subtitle.fontSize?.tablet || 20}px\`,
                    "--s-fs-mob": \`\${subtitle.fontSize?.mobile || 18}px\`,
                    "--s-lh-desk": subtitle.lineHeight?.desktop || '1.4',
                    "--s-lh-tab": subtitle.lineHeight?.tablet || '1.4',
                    "--s-lh-mob": subtitle.lineHeight?.mobile || '1.4',
                  } as React.CSSProperties}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done Contact.tsx');
