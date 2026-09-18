const fs = require('fs');
const file = 'src/components/SmoothScrollSnap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const container = document\.querySelector\('\.custom-scrollbar'\) \|\| window;\s+container\.addEventListener\("scroll", handleScroll, { passive: true }\);\s+container\.addEventListener\("scrollend", handleScrollEnd as EventListener\);/,
  `window.addEventListener("scroll", handleScroll, { passive: true, capture: true });\n    window.addEventListener("scrollend", handleScrollEnd, { capture: true });`
);

code = code.replace(
  /const container = document\.querySelector\('\.custom-scrollbar'\) \|\| window;\s+container\.removeEventListener\("scroll", handleScroll\);\s+container\.removeEventListener\("scrollend", handleScrollEnd as EventListener\);/,
  `window.removeEventListener("scroll", handleScroll, { capture: true } as any);\n      window.removeEventListener("scrollend", handleScrollEnd, { capture: true } as any);`
);

// We need to pass the target from the event to the handlers!
code = code.replace(
  /const handleScroll = \(\) => {/g,
  `let lastScrollTarget: EventTarget | null = null;\n    const handleScroll = (e?: Event) => {\n      if (e) lastScrollTarget = e.target;\n`
);

code = code.replace(
  /const handleScrollEnd = \(\) => {/g,
  `const handleScrollEnd = (e?: Event) => {\n      if (e) lastScrollTarget = e.target;\n`
);

// Inside snapToClosestSection we check lastScrollTarget
code = code.replace(
  /const scrollContainer = document\.querySelector\('\.custom-scrollbar'\) \|\| window;/g,
  `const scrollContainer = (lastScrollTarget instanceof Element && lastScrollTarget.classList.contains('custom-scrollbar')) ? lastScrollTarget : window;`
);

fs.writeFileSync(file, code);
