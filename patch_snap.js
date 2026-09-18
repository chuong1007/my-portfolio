const fs = require('fs');
const file = 'src/components/SmoothScrollSnap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const scrollY = window.scrollY;',
  `const scrollContainer = document.querySelector('.custom-scrollbar') || window;
      const isWindow = scrollContainer === window;
      const scrollY = isWindow ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;`
);

code = code.replace(
  'const startScroll = window.scrollY;',
  `const startScroll = isWindow ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;`
);

code = code.replace(
  'window.scrollTo(0, startScroll + (distance * easeProgress));',
  `if (isWindow) {
            window.scrollTo(0, startScroll + (distance * easeProgress));
          } else {
            (scrollContainer as HTMLElement).scrollTo(0, startScroll + (distance * easeProgress));
          }`
);

code = code.replace(
  'window.addEventListener("scroll", handleScroll, { passive: true });\n    window.addEventListener("scrollend", handleScrollEnd);',
  `const container = document.querySelector('.custom-scrollbar') || window;
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd as EventListener);`
);

code = code.replace(
  'window.removeEventListener("scroll", handleScroll);\n      window.removeEventListener("scrollend", handleScrollEnd);',
  `const container = document.querySelector('.custom-scrollbar') || window;
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", handleScrollEnd as EventListener);`
);

code = code.replace(
  'window.addEventListener(\'wheel\', cancelAnimation, { passive: true });\n        window.addEventListener(\'touchstart\', cancelAnimation, { passive: true });',
  `const container = document.querySelector('.custom-scrollbar') || window;
        container.addEventListener('wheel', cancelAnimation, { passive: true });
        container.addEventListener('touchstart', cancelAnimation, { passive: true });`
);

code = code.replace(
  'window.removeEventListener(\'wheel\', cancelAnimation);\n          window.removeEventListener(\'touchstart\', cancelAnimation);',
  `const container = document.querySelector('.custom-scrollbar') || window;
          container.removeEventListener('wheel', cancelAnimation);
          container.removeEventListener('touchstart', cancelAnimation);`
);

code = code.replace(
  'const rect = section.getBoundingClientRect();',
  `const rect = section.getBoundingClientRect();
        
        let containerOffset = 0;
        if (!isWindow) {
          const containerRect = (scrollContainer as HTMLElement).getBoundingClientRect();
          containerOffset = containerRect.top;
        }`
);

code = code.replace(
  'const distanceFromIdeal = rect.top - idealTopOnScreen;',
  `const distanceFromIdeal = (rect.top - containerOffset) - idealTopOnScreen;`
);

fs.writeFileSync(file, code);
