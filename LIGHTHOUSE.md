# Lighthouse CI Setup

This project uses [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to ensure all pages maintain excellent performance, accessibility, best practices, and SEO scores.

## Quick Start

Run Lighthouse on all pages:

```bash
npm run lighthouse
```

This will:
1. Build the site
2. Start a local preview server
3. Run Lighthouse on all pages (3 runs each for consistency)
4. Output results to `.lighthouseci/`

## Available Commands

```bash
# Run full Lighthouse audit
npm run lighthouse

# Extract URLs from sitemap (useful when adding new pages)
npm run lighthouse:urls

# Open HTML reports in browser (macOS)
npm run lighthouse:open
```

## Configuration

The Lighthouse configuration is in `lighthouserc.js`:

### Thresholds

**Performance:**
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 200ms
- Speed Index: < 3.4s

**Category Scores:**
- Performance: ≥ 99/100
- Accessibility: 100/100
- Best Practices: ≥ 92/100
- SEO: 100/100

**Resource Budgets:**
- HTML: < 50KB
- CSS: < 100KB
- JavaScript: < 250KB
- Images: < 500KB
- Fonts: < 150KB

### Testing Settings

- **Device**: Desktop
- **Throttling**: Simulated fast 4G
- **Runs**: 3 per URL (median result used)
- **URLs**: Automatically includes all pages from sitemap.xml

## Understanding Results

### Console Output

Lighthouse CI outputs a summary to the console:

```
✅ All assertions passed
```

Or if there are issues:

```
❌ Performance score of 0.95 does not meet assertion
   Expected: >= 0.99
```

### HTML Reports

Detailed HTML reports are saved to `.lighthouseci/`:

- `lhr-{url}-{timestamp}.html` - Individual page reports
- Each report includes:
  - Score breakdowns
  - Opportunities for improvement
  - Passed audits
  - Diagnostics

View reports:
```bash
npm run lighthouse:open
```

Or manually open files from `.lighthouseci/`

## Maintaining 100% Scores

### Performance Tips

1. **Keep bundles small**: Use code splitting and tree shaking
2. **Optimize images**: Use WebP format, responsive images
3. **Minimize CSS/JS**: Remove unused code
4. **Cache aggressively**: Set long cache times for static assets
5. **Preload critical resources**: Use `<link rel="preload">` for LCP

### Accessibility Tips

1. **Alt text**: All images must have descriptive alt text
2. **Color contrast**: Maintain 4.5:1 minimum contrast ratio
3. **ARIA labels**: Use for icon buttons and interactive elements
4. **Semantic HTML**: Use proper heading hierarchy (h1-h6)
5. **Keyboard navigation**: Ensure all interactive elements are keyboard-accessible

### SEO Tips

1. **Meta descriptions**: Every page needs unique meta description
2. **Title tags**: Descriptive, unique titles for each page
3. **Canonical URLs**: Set properly to avoid duplicate content
4. **Structured data**: Use JSON-LD for rich snippets
5. **Mobile-friendly**: Responsive design, proper viewport meta tag

### Best Practices Tips

1. **HTTPS**: Always use HTTPS in production
2. **Security headers**: CSP, HSTS, X-Frame-Options, etc.
3. **No console errors**: Clean browser console
4. **Modern image formats**: WebP, AVIF
5. **HTTP/2**: Use modern protocols (Cloudflare Pages does this automatically)

## Adding New Pages

When you add new pages:

1. They're automatically added to `sitemap.xml` on build
2. Lighthouse automatically reads from the sitemap at runtime
3. Just run `npm run lighthouse` - new pages are tested automatically!

**No manual configuration needed!** The URLs are dynamically extracted from the sitemap each time you run Lighthouse.

(The `npm run lighthouse:urls` script is optional - useful for debugging to see which URLs will be tested.)

## CI/CD Integration

You can run Lighthouse in GitHub Actions:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lighthouse
```

## Troubleshooting

### "Cannot find module" error
Make sure dependencies are installed:
```bash
npm install
```

### "Error reading sitemap" error
Build the site first:
```bash
npm run build
```

### Preview server won't start
Check if port 4173 is already in use:
```bash
lsof -ti:4173 | xargs kill -9
```

### Tests pass locally but fail in CI
CI environments may be slower. Adjust thresholds in `lighthouserc.js`:
- Increase `maxNumericValue` for timing metrics
- Decrease `minScore` slightly if needed

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Web Vitals](https://web.dev/vitals/)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
