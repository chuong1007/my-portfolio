const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add <style> block for About
const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .about-container:not(.is-editor) {
          padding-top: var(--pt-mob);
          padding-bottom: var(--pb-mob);
        }
        .about-inner:not(.is-editor) {
          padding-left: 16px;
          padding-right: 16px;
        }
        .about-heading:not(.is-editor) {
          font-size: var(--fs-mob);
          line-height: var(--lh-mob);
          font-family: var(--ff-mob);
          font-weight: var(--fw-mob);
        }
        .about-subheading:not(.is-editor) {
          font-size: var(--fs-sub-mob);
          line-height: var(--lh-sub-mob);
          font-family: var(--ff-sub-mob);
          font-weight: var(--fw-sub-mob);
        }
        .about-p:not(.is-editor) {
          font-size: var(--fs-p-mob);
        }
        
        .about-layout:not(.is-editor) {
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .about-container:not(.is-editor) {
            padding-top: var(--pt-tab);
            padding-bottom: var(--pb-tab);
          }
          .about-inner:not(.is-editor) {
            padding-left: 48px;
            padding-right: 48px;
          }
          .about-heading:not(.is-editor) {
            font-size: var(--fs-tab);
            line-height: var(--lh-tab);
            font-family: var(--ff-tab);
            font-weight: var(--fw-tab);
          }
          .about-subheading:not(.is-editor) {
            font-size: var(--fs-sub-tab);
            line-height: var(--lh-sub-tab);
            font-family: var(--ff-sub-tab);
            font-weight: var(--fw-sub-tab);
          }
          .about-p:not(.is-editor) {
            font-size: var(--fs-p-tab);
          }
          .about-layout:not(.is-editor) {
            flex-direction: row;
          }
        }

        @media (min-width: 1024px) {
          .about-container:not(.is-editor) {
            padding-top: var(--pt-desk);
            padding-bottom: var(--pb-desk);
          }
          .about-heading:not(.is-editor) {
            font-size: var(--fs-desk);
            line-height: var(--lh-desk);
            font-family: var(--ff-desk);
            font-weight: var(--fw-desk);
          }
          .about-subheading:not(.is-editor) {
            font-size: var(--fs-sub-desk);
            line-height: var(--lh-sub-desk);
            font-family: var(--ff-sub-desk);
            font-weight: var(--fw-sub-desk);
          }
          .about-p:not(.is-editor) {
            font-size: var(--fs-p-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section\s+id="about"/,
  `${styleBlock}\n      <section id="about"`
);

// Container classes
content = content.replace(
  /className="relative bg-\[var\(--bg-base\)\] transition-all duration-700"/,
  `className={cn("about-container relative bg-[var(--bg-base)] transition-all duration-700", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

// Inner container
content = content.replace(
  /className=\{cn\(\s*"max-w-4xl mx-auto",\s*!isEditor && "px-4 md:px-12"\s*\)\}/,
  `className={cn("about-inner max-w-4xl mx-auto", !isEditor && "not-is-editor", isEditor && "is-editor",
    isEditor && globalPreviewMode === 'mobile' && "px-4",
    isEditor && globalPreviewMode === 'tablet' && "px-8",
    isEditor && globalPreviewMode === 'desktop' && "px-12"
  )}`
);

// Layout: "phần giơi thiệu avatar chiếm nhiều diện tích quá cho lên trên about me và size bé lại đi để phần chữ rộng hơn"
// The user wants avatar on top of 'about me', which means flex-col.
content = content.replace(
  /className=\{cn\("flex flex-col md:flex-row gap-6 md:gap-8", avatarUrl \? "md:items-start" : ""\)\}/,
  `className={cn("about-layout flex gap-6 md:gap-8", !isEditor && "not-is-editor", isEditor && "is-editor",
    isEditor && globalPreviewMode !== 'desktop' ? "flex-col" : "flex-col md:flex-row",
    avatarUrl ? "md:items-start" : ""
  )}`
);

// Heading
content = content.replace(
  /className="tracking-tighter text-\[var\(--text-primary\)\] text-balance whitespace-pre-wrap \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] \[\&_h1\]:m-0 \[\&_h2\]:m-0 \[\&_h3\]:m-0 \[\&_span\[style\*='color'\]_strong\]:text-inherit"/,
  `className={cn("about-heading tracking-tighter text-[var(--text-primary)] text-balance whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

// Subheading
content = content.replace(
  /className="text-\[var\(--text-muted\)\] whitespace-pre-wrap \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] \[\&_h1\]:m-0 \[\&_h2\]:m-0 \[\&_h3\]:m-0"/,
  `className={cn("about-subheading text-[var(--text-muted)] whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);

// Avatar sizing logic - they wanted it smaller on mobile
content = content.replace(
  /className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-\[var\(--border-default\)\]\/50 shadow-xl shadow-black\/30"/,
  `className={cn("rounded-full object-cover border-2 border-[var(--border-default)]/50 shadow-xl shadow-black/30",
    isEditor && globalPreviewMode !== 'desktop' ? "w-16 h-16" : "w-16 h-16 md:w-24 md:h-24"
  )}`
);

// Paragraphs wrapper
content = content.replace(
  /className="space-y-4 text-\[var\(--text-muted\)\] "/,
  `className="space-y-4 text-[var(--text-muted)]"`
);
content = content.replace(
  /key=\{i\}\n\s*style=\{\{\n\s*fontSize: \`\$\{p\.fontSize\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| 18\}px\`,\n\s*\}\}\n\s*className="whitespace-pre-wrap \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] \[\&_h1\]:m-0 \[\&_h2\]:m-0 \[\&_h3\]:m-0 \[\&_span\[style\*='color'\]_strong\]:text-inherit"/g,
  `key={i}
                        style={{
                          fontSize: isEditor ? \`\${p.fontSize?.[globalPreviewMode || 'desktop'] || 18}px\` : undefined,
                          "--fs-p-desk": \`\${p.fontSize?.desktop || 18}px\`,
                          "--fs-p-tab": \`\${p.fontSize?.tablet || 16}px\`,
                          "--fs-p-mob": \`\${p.fontSize?.mobile || 14}px\`,
                        } as React.CSSProperties}
                        className={cn("about-p whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_span[style*='color']_strong]:text-inherit", !isEditor && "not-is-editor", isEditor && "is-editor")}`
);


// Replace the inline heading styles with CSS vars
content = content.replace(
  /style=\{\{\n\s*fontSize: \`\$\{heading\.fontSize\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| 30\}px\`,\n\s*lineHeight: heading\.lineHeight\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| '1\.1',\n\s*fontFamily: heading\.fontFamily\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| 'inherit',\n\s*fontWeight: heading\.fontWeight\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| '700',\n\s*\}\}/,
  `style={{
                      fontSize: isEditor ? \`\${heading.fontSize?.[globalPreviewMode || 'desktop'] || 30}px\` : undefined,
                      lineHeight: isEditor ? (heading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                      fontFamily: isEditor ? (heading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                      fontWeight: isEditor ? (heading.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                      "--fs-desk": \`\${heading.fontSize?.desktop || 30}px\`,
                      "--fs-tab": \`\${heading.fontSize?.tablet || 24}px\`,
                      "--fs-mob": \`\${heading.fontSize?.mobile || 20}px\`,
                      "--lh-desk": heading.lineHeight?.desktop || '1.1',
                      "--lh-tab": heading.lineHeight?.tablet || '1.1',
                      "--lh-mob": heading.lineHeight?.mobile || '1.1',
                      "--ff-desk": heading.fontFamily?.desktop || 'inherit',
                      "--ff-tab": heading.fontFamily?.tablet || 'inherit',
                      "--ff-mob": heading.fontFamily?.mobile || 'inherit',
                      "--fw-desk": heading.fontWeight?.desktop || '700',
                      "--fw-tab": heading.fontWeight?.tablet || '700',
                      "--fw-mob": heading.fontWeight?.mobile || '700',
                    } as React.CSSProperties}`
);

// Replace the inline subheading styles with CSS vars
content = content.replace(
  /style=\{\{\n\s*fontSize: \`\$\{getResponsiveValue\(subheading\.fontSize, globalPreviewMode \|\| 'desktop'\) \|\| 18\}px\`,\n\s*lineHeight: getResponsiveValue\(subheading\.lineHeight, globalPreviewMode \|\| 'desktop'\) \|\| '1\.5',\n\s*fontFamily: subheading\.fontFamily\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| 'inherit',\n\s*fontWeight: subheading\.fontWeight\?\.\[globalPreviewMode \|\| 'desktop'\] \|\| '400',\n\s*\}\}/,
  `style={{
                      fontSize: isEditor ? \`\${subheading.fontSize?.[globalPreviewMode || 'desktop'] || 18}px\` : undefined,
                      lineHeight: isEditor ? (subheading.lineHeight?.[globalPreviewMode || 'desktop'] || '1.5') : undefined,
                      fontFamily: isEditor ? (subheading.fontFamily?.[globalPreviewMode || 'desktop'] || 'inherit') : undefined,
                      fontWeight: isEditor ? (subheading.fontWeight?.[globalPreviewMode || 'desktop'] || '400') : undefined,
                      "--fs-sub-desk": \`\${subheading.fontSize?.desktop || 18}px\`,
                      "--fs-sub-tab": \`\${subheading.fontSize?.tablet || 16}px\`,
                      "--fs-sub-mob": \`\${subheading.fontSize?.mobile || 14}px\`,
                      "--lh-sub-desk": subheading.lineHeight?.desktop || '1.5',
                      "--lh-sub-tab": subheading.lineHeight?.tablet || '1.5',
                      "--lh-sub-mob": subheading.lineHeight?.mobile || '1.5',
                      "--ff-sub-desk": subheading.fontFamily?.desktop || 'inherit',
                      "--ff-sub-tab": subheading.fontFamily?.tablet || 'inherit',
                      "--ff-sub-mob": subheading.fontFamily?.mobile || 'inherit',
                      "--fw-sub-desk": subheading.fontWeight?.desktop || '400',
                      "--fw-sub-tab": subheading.fontWeight?.tablet || '400',
                      "--fw-sub-mob": subheading.fontWeight?.mobile || '400',
                    } as React.CSSProperties}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done About.tsx');
