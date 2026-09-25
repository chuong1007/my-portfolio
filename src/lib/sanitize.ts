export const cleanHtmlColors = (html?: string | null) => {
  if (!html) return "";
  
  // 1. Basic sanitize against XSS (Remove script tags)
  // Note: For a personal portfolio where content is only edited by the admin,
  // a lightweight regex is sufficient and avoids heavy jsdom dependencies that crash Vercel.
  const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Clean colors for Dark/Light mode overrides
  return sanitized
    .replace(/color:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi, 'color: inherit')
    .replace(/-webkit-text-fill-color:\s*transparent/gi, '')
    .replace(/background:\s*linear-gradient[^;"']+;?/gi, '')
    .replace(/background-clip:\s*text/gi, '');
};
