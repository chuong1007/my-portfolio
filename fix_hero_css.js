const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const styleBlock = `
      <style dangerouslySetInnerHTML={{ __html: \`
        .hero-container:not(.is-editor) {
          padding-top: var(--pad-mob);
          padding-bottom: var(--pb-mob);
        }
        .hero-title-inner:not(.is-editor) {
          font-size: var(--fs-mob);
          line-height: var(--lh-mob);
          font-family: var(--ff-mob);
          font-weight: var(--fw-mob);
          color: var(--color-mob, inherit);
        }
        .hero-subtitle:not(.is-editor) {
          font-size: var(--fs-sub-mob);
          line-height: var(--lh-sub-mob);
          font-family: var(--ff-sub-mob);
          font-weight: var(--fw-sub-mob);
          color: var(--color-sub-mob, inherit);
        }
        .hero-scroll:not(.is-editor) {
          margin-bottom: var(--scroll-mob);
        }

        @media (min-width: 768px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-tab);
            padding-bottom: var(--pb-tab);
          }
          .hero-title-inner:not(.is-editor) {
            font-size: var(--fs-tab);
            line-height: var(--lh-tab);
            font-family: var(--ff-tab);
            font-weight: var(--fw-tab);
            color: var(--color-tab, inherit);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-tab);
            line-height: var(--lh-sub-tab);
            font-family: var(--ff-sub-tab);
            font-weight: var(--fw-sub-tab);
            color: var(--color-sub-tab, inherit);
          }
          .hero-scroll:not(.is-editor) {
            margin-bottom: var(--scroll-tab);
          }
        }

        @media (min-width: 1024px) {
          .hero-container:not(.is-editor) {
            padding-top: var(--pad-desk);
            padding-bottom: var(--pb-desk);
          }
          .hero-title-inner:not(.is-editor) {
            font-size: var(--fs-desk);
            line-height: var(--lh-desk);
            font-family: var(--ff-desk);
            font-weight: var(--fw-desk);
            color: var(--color-desk, inherit);
          }
          .hero-subtitle:not(.is-editor) {
            font-size: var(--fs-sub-desk);
            line-height: var(--lh-sub-desk);
            font-family: var(--ff-sub-desk);
            font-weight: var(--fw-sub-desk);
            color: var(--color-sub-desk, inherit);
          }
          .hero-scroll:not(.is-editor) {
            margin-bottom: var(--scroll-desk);
          }
        }
      \`}} />
`;

content = content.replace(
  /<section ref=\{heroRef\}/,
  `${styleBlock}\n      <section ref={heroRef} className="hero-container"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Hero CSS');
