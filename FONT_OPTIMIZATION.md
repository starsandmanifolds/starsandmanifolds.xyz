# Dancing Script Font Optimization

## Problem Statement

PageSpeed Insights identified that the Dancing Script font was on the critical rendering path with a **522ms load time**, significantly impacting site performance.

### Original Setup
- Used full `@fontsource/dancing-script/700.css` import
- Loaded **3 font subsets**: Vietnamese, Latin-ext, and Latin
- Total WOFF2 size: **~44KB** (25KB + 14KB + 4.9KB)
- All three font files were being downloaded even though only Latin characters are used

## Solution Implemented

Created a custom, optimized Dancing Script CSS file that loads only the Latin subset.

### Changes Made

1. **Created**: `/src/lib/fonts/dancing-script.css`
   - Contains only the Latin subset `@font-face` declaration
   - Maintains `font-display: swap` for non-blocking render
   - References the same Fontsource font files via relative imports

2. **Modified**: `/src/app.css`
   - Replaced: `@import "@fontsource/dancing-script/700.css";`
   - With: `@import "$lib/fonts/dancing-script.css";`

### Font Usage Analysis

Dancing Script (weight 700) is used in **2 locations**:
- **Header**: Site logo/title (above-the-fold, critical)
- **Footer**: Brand name (below-the-fold)

Both locations only use standard Latin characters (A-Z, a-z), making Vietnamese and Latin-ext subsets unnecessary.

## Performance Impact

### File Size Reduction
- **Before**: 44KB WOFF2 (3 files)
- **After**: 25KB WOFF2 (1 file)
- **Savings**: 19KB (~43% reduction)

### Network Requests
- **Before**: 3 font file requests
- **After**: 1 font file request
- **Reduction**: 67% fewer requests

### Expected Performance Improvements
1. **Faster font download**: 43% less data to transfer
2. **Reduced latency**: 2 fewer HTTP requests (eliminates 2 round trips)
3. **Earlier font availability**: Single file downloads faster, reducing FOUT/FOIT
4. **Better LCP**: Critical above-the-fold text (header logo) renders sooner

### Rendering Strategy
- **font-display: swap** - Text is visible immediately with fallback font (cursive)
- When Dancing Script loads, text smoothly swaps to the custom font
- No layout shift (fallback and custom fonts have similar metrics)

## Technical Details

### Font Subsetting
The Latin subset includes:
- Basic Latin: A-Z, a-z, 0-9
- Common punctuation and symbols
- Currency symbols (€, $, £, ¥)
- Math operators and arrows
- Unicode range: `U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`

This covers all English text and common symbols used on the site.

### Build Process
Vite automatically:
1. Resolves the `@fontsource` font file imports
2. Copies font files to `_app/immutable/assets/`
3. Adds content hashes to filenames for cache busting
4. Updates CSS URLs to point to hashed filenames

### Browser Support
- **WOFF2**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **WOFF fallback**: Included for older browsers (IE11+)

## Verification

### Build Output
```bash
# Only Latin subset is included
.svelte-kit/output/client/_app/immutable/assets/dancing-script-latin-700-normal.CX8AaSVl.woff2 (25KB)
.svelte-kit/output/client/_app/immutable/assets/dancing-script-latin-700-normal.LI5MgW9m.woff (30KB)
```

### CSS Output
The generated CSS contains only one `@font-face` declaration for Dancing Script with the Latin unicode-range.

## Future Considerations

### If internationalization is needed:
The optimization can be adjusted by modifying `/src/lib/fonts/dancing-script.css`:
- **German/French/Spanish**: Keep Latin-ext subset (add 14KB)
- **Vietnamese**: Add Vietnamese subset (add 4.9KB)

### Further Optimizations Considered but NOT Implemented:
1. **Preloading**: Decided against preloading because:
   - `font-display: swap` already prevents render blocking
   - Font is above-the-fold but not LCP element
   - Preloading would compete with LCP image (logo.webp) for bandwidth
   - Modern browsers prioritize font loading effectively

2. **font-display: optional**: Decided against because:
   - Would hide text entirely if font doesn't load in ~100ms
   - `swap` provides better UX with fallback font visibility
   - Page has strong brand identity requiring the decorative font

3. **Variable font**: Dancing Script doesn't offer a variable font version
   - Stick with optimized static subset

## Monitoring

To verify the optimization in production:
1. Run PageSpeed Insights and check:
   - Font load time reduced from 522ms
   - Fewer font-related network requests
   - Improved FCP/LCP scores
2. Check Network tab in DevTools:
   - Only 1 Dancing Script WOFF2 file loads
   - File size is ~25KB

## Rollback Plan

If issues arise, revert by changing `/src/app.css`:
```css
/* Revert to original */
@import "@fontsource/dancing-script/700.css";
```

Then delete `/src/lib/fonts/dancing-script.css`.

---

**Optimization completed**: 2025-11-03
**Expected impact**: ~43% reduction in Dancing Script font data, 67% fewer font requests
