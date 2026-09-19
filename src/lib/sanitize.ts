import DOMPurify from 'isomorphic-dompurify';

export const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  
  // 1. Sanitize against XSS
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'ol', 'div', 'img', 'blockquote', 'code', 'pre', 'svg', 'path', 'g', 'circle', 'rect', 'line', 'polygon', 'polyline'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'width', 'height', 'fill', 'viewBox', 'xmlns', 'd', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  });

  // 2. Clean colors for Dark/Light mode overrides
  return sanitized
    .replace(/color:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi, 'color: inherit')
    .replace(/-webkit-text-fill-color:\s*transparent/gi, '')
    .replace(/background:\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\s*text/gi, '');
};
