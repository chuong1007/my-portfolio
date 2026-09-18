const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync('hero_backup.tsx', 'utf8');

// 1. Add style block right after <section id="home">
const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .hero-container:not(.is-editor) {
          padding-top: var(--pad-mob);
          padding-bottom: var(--pb-mob);
        }
        .hero-title:not(.is-editor) {
          font-size: var(--fs-mob);
        }
        .hero-title-inner:not(.is-editor) {
          line-height: var(--lh-mob);
          font-family: var(--ff-mob);
          font-weight: var(--fw-mob);
        }
        .hero-scroll:not(.is-editor) {
          margin-top: var(--scroll-mob);
        }
        .hero-subtitle:not(.is-editor) {
          font-size: var(--fs-sub-mob);
          line-height: var(--lh-sub-mob);
          font-family: var(--ff-sub-mob);
          font-weight: var(--fw-sub-mob);
        }

        @media (min-width: 768px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-tab);
            padding-bottom: var(--pb-tab);
          }
          .hero-title:not(.is-editor) {
            font-size: var(--fs-tab);
          }
          .hero-title-inner:not(.is-editor) {
            line-height: var(--lh-tab);
            font-family: var(--ff-tab);
            font-weight: var(--fw-tab);
          }
          .hero-scroll:not(.is-editor) {
            margin-top: var(--scroll-tab);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-tab);
            line-height: var(--lh-sub-tab);
            font-family: var(--ff-sub-tab);
            font-weight: var(--fw-sub-tab);
          }
        }

        @media (min-width: 1024px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-desk);
            padding-bottom: var(--pb-desk);
          }
          .hero-title:not(.is-editor) {
            font-size: var(--fs-desk);
          }
          .hero-title-inner:not(.is-editor) {
            line-height: var(--lh-desk);
            font-family: var(--ff-desk);
            font-weight: var(--fw-desk);
          }
          .hero-scroll:not(.is-editor) {
            margin-top: var(--scroll-desk);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-desk);
            line-height: var(--lh-sub-desk);
            font-family: var(--ff-sub-desk);
            font-weight: var(--fw-sub-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section\s+id="home"\s+className=\{cn\(/,
  `<section id="home" className={cn("hero-container", !isEditor && "not-is-editor", isEditor && "is-editor",`
);
content = content.replace(
  /!isEditor && "pt-\[var\(--pad-mob\)\] md:pt-\[var\(--pad-tab\)\] lg:pt-\[var\(--pad-desk\)\]",\s*!isEditor && "pb-\[var\(--pb-mob\)\] md:pb-\[var\(--pb-tab\)\] lg:pb-\[var\(--pb-desk\)\]"/,
  ""
);

content = content.replace(
  /<div className="w-full flex-1 flex flex-col justify-center relative z-10 px-6">/,
  `${styleBlock}\n        <div className="w-full flex-1 flex flex-col justify-center relative z-10 px-6">`
);

content = content.replace(
  /className=\{cn\(\s*"tracking-tighter text-\[var\(--text-primary\)\] text-balance mx-auto whitespace-pre-wrap transition-all duration-300",\s*!isEditor && "text-\[length:var\(--fs-mob\)\] md:text-\[length:var\(--fs-tab\)\] lg:text-\[length:var\(--fs-desk\)\]"\s*\)\}/,
  `className={cn("hero-title", !isEditor && "not-is-editor", isEditor && "is-editor",
              "tracking-tighter text-[var(--text-primary)] text-balance mx-auto whitespace-pre-wrap transition-all duration-300"
            )}`
);

content = content.replace(
  /className=\{cn\(\s*"w-full whitespace-pre-wrap \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\]",\s*!isEditor && "leading-\[var\(--lh-mob\)\] md:leading-\[var\(--lh-tab\)\] lg:leading-\[var\(--lh-desk\)\] \[font-family:var\(--ff-mob\)\] md:\[font-family:var\(--ff-tab\)\] lg:\[font-family:var\(--ff-desk\)\] font-\[var\(--fw-mob\)\] md:font-\[var\(--fw-tab\)\] lg:font-\[var\(--fw-desk\)\]"\s*\)\}/,
  `className={cn("hero-title-inner", !isEditor && "not-is-editor", isEditor && "is-editor",
                "w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]"
              )}`
);

content = content.replace(
  /className=\{cn\(\s*"flex flex-col items-center gap-2 text-\[var\(--text-muted\)\]",\s*!isEditor && "mt-\[var\(--scroll-mob\)\] md:mt-\[var\(--scroll-tab\)\] lg:mt-\[var\(--scroll-desk\)\]"\s*\)\}/,
  `className={cn("hero-scroll", !isEditor && "not-is-editor", isEditor && "is-editor",
    "flex flex-col items-center gap-2 text-[var(--text-muted)]"
  )}`
);

content = content.replace(
  /className=\{cn\(\s*"uppercase tracking-\[0\.2em\] whitespace-pre-wrap \[\&_p\]:m-0 \[\&_p\]:leading-\[inherit\] transition-all duration-300",\s*!isEditor && "text-\[length:var\(--fs-sub-mob\)\] md:text-\[length:var\(--fs-sub-tab\)\] lg:text-\[length:var\(--fs-sub-desk\)\] leading-\[var\(--lh-sub-mob\)\] md:leading-\[var\(--lh-sub-tab\)\] lg:leading-\[var\(--lh-sub-desk\)\] \[font-family:var\(--ff-sub-mob\)\] md:\[font-family:var\(--ff-sub-tab\)\] lg:\[font-family:var\(--ff-sub-desk\)\] font-\[var\(--fw-sub-mob\)\] md:font-\[var\(--fw-sub-tab\)\] lg:font-\[var\(--fw-sub-desk\)\]"\s*\)\}/,
  `className={cn("hero-subtitle", !isEditor && "not-is-editor", isEditor && "is-editor",
      "uppercase tracking-[0.2em] whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit] transition-all duration-300"
    )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacement.');
