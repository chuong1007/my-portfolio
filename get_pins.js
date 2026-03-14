const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const queries = [
    { q: 'cosmetics packaging design poster', key: 'Poster' },
    { q: 'brand identity design mockup', key: 'Branding' },
    { q: 'logo design typography', key: 'Logo Design' },
    { q: 'mobile app ui ux design dashboard dark mode', key: 'UX/UI' }
  ];

  for (let item of queries) {
    const page = await browser.newPage();
    await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(item.q)}`, { waitUntil: 'networkidle2' });
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[src*="i.pinimg.com"]'));
      return imgs
        .map(img => img.src)
        .filter(src => src.includes('/236x/') || src.includes('/474x/') || src.includes('/564x/') || src.includes('/originals/'))
        // get higher quality
        .map(src => src.replace(/\/(236|474|564|736)x\//, '/736x/'))
        .slice(0, 5);
    });
    console.log(`${item.key}:`);
    console.log(JSON.stringify(images, null, 2));
    await page.close();
  }
  await browser.close();
})();
