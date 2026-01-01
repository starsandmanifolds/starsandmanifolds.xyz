/**
 * Puppeteer script to emulate color scheme for Lighthouse CI.
 * Uses CDP to set emulated media at the browser target level.
 *
 * Set COLOR_SCHEME environment variable to 'light' or 'dark'.
 */
module.exports = async (browser) => {
  const colorScheme = process.env.COLOR_SCHEME;

  if (!colorScheme) {
    throw new Error('COLOR_SCHEME environment variable must be set to "light" or "dark"');
  }

  const setColorScheme = async (page) => {
    const client = await page.createCDPSession();
    await client.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: colorScheme }]
    });
  };

  // Set on all existing pages
  for (const page of await browser.pages()) {
    await setColorScheme(page);
  }

  // Set on any new pages Lighthouse creates
  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const page = await target.page();
      if (page) await setColorScheme(page);
    }
  });
};
