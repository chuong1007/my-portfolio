const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/Hero.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldDiv = `<div 
              className={cn(
                "w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]",
                !isEditor && "leading-[var(--lh-mob)] md:leading-[var(--lh-tab)] lg:leading-[var(--lh-desk)] [font-family:var(--ff-mob)] md:[font-family:var(--ff-tab)] lg:[font-family:var(--ff-desk)] font-[var(--fw-mob)] md:font-[var(--fw-tab)] lg:font-[var(--fw-desk)]"
              )}
              style={{
                lineHeight: isEditor ? (titleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                fontFamily: isEditor ? (titleData.fontFamily?.[globalPreviewMode || 'desktop'] || 'Syne, sans-serif') : undefined,
                fontWeight: isEditor ? (titleData.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                color: isEditor ? (titleData.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : titleData.textColor?.[globalPreviewMode || 'desktop']) : (globalPreviewMode === 'mobile' ? 'var(--color-mob)' : globalPreviewMode === 'tablet' ? 'var(--color-tab)' : 'var(--color-desk)'),
              }}
              dangerouslySetInnerHTML={{ __html: cleanHtmlColors(getResponsiveValue(titleData.content, globalPreviewMode || 'desktop') || "") }} 
            />`;

const newDiv = `<HeroAnimatedTitle
              className={cn(
                "w-full whitespace-pre-wrap [&_p]:m-0 [&_p]:leading-[inherit]",
                !isEditor && "leading-[var(--lh-mob)] md:leading-[var(--lh-tab)] lg:leading-[var(--lh-desk)] [font-family:var(--ff-mob)] md:[font-family:var(--ff-tab)] lg:[font-family:var(--ff-desk)] font-[var(--fw-mob)] md:font-[var(--fw-tab)] lg:font-[var(--fw-desk)]"
              )}
              style={{
                lineHeight: isEditor ? (titleData.lineHeight?.[globalPreviewMode || 'desktop'] || '1.1') : undefined,
                fontFamily: isEditor ? (titleData.fontFamily?.[globalPreviewMode || 'desktop'] || 'Syne, sans-serif') : undefined,
                fontWeight: isEditor ? (titleData.fontWeight?.[globalPreviewMode || 'desktop'] || '700') : undefined,
                color: isEditor ? (titleData.textColor?.[globalPreviewMode || 'desktop'] === 'inherit' ? undefined : titleData.textColor?.[globalPreviewMode || 'desktop']) : (globalPreviewMode === 'mobile' ? 'var(--color-mob)' : globalPreviewMode === 'tablet' ? 'var(--color-tab)' : 'var(--color-desk)'),
              }}
              html={cleanHtmlColors(getResponsiveValue(titleData.content, globalPreviewMode || 'desktop') || "")}
            />`;

if (content.includes(oldDiv)) {
  content = content.replace(oldDiv, newDiv);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced div with HeroAnimatedTitle');
} else {
  console.log('Could not find the exact div. Checking manually...');
}
