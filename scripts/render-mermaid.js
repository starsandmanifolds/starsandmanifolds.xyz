#!/usr/bin/env node

/**
 * Pre-build script to render mermaid diagrams from markdown files.
 * Runs before Vite build to generate SVGs that get committed to the repo.
 * This keeps Node.js-only code out of the Cloudflare Workers bundle.
 */

import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { mkdtempSync } from "fs";

const CONTENT_DIR = "src/content/blog";
const OUTPUT_DIR = "static/mermaid";
const MERMAID_REGEX = /```mermaid\n([\s\S]*?)```/g;

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a hash for mermaid content to use as filename.
 * Uses djb2 algorithm - must match simpleHash() in src/lib/markdown.ts
 */
function getHash(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Render a mermaid diagram to SVG
 */
function renderMermaid(code, hash) {
  const outputFile = join(OUTPUT_DIR, `${hash}.svg`);

  // Skip if already rendered
  if (existsSync(outputFile)) {
    console.log(`  ✓ ${hash}.svg (cached)`);
    return;
  }

  const tempDir = mkdtempSync(join(tmpdir(), "mermaid-"));
  const inputFile = join(tempDir, "input.mmd");

  try {
    writeFileSync(inputFile, code);

    execSync(
      `npx mmdc -i "${inputFile}" -o "${outputFile}" -c mermaid.config.json -p puppeteer.config.json -b transparent`,
      { stdio: "pipe" }
    );

    // Add class to SVG and inject dark mode CSS
    // SVGs loaded via <object> are isolated, so they need their own dark mode styles
    let svg = readFileSync(outputFile, "utf-8");
    svg = svg.replace(/<svg /, '<svg class="mermaid-diagram" ');

    // Inject dark mode CSS that matches app.css (Catppuccin Mocha colors)
    const darkModeCSS = `
<style>
@media (prefers-color-scheme: dark) {
  /* Force transparent background on SVG document */
  :root, svg, svg.mermaid-diagram { background: transparent !important; background-color: transparent !important; }
  /* Actor boxes */
  rect.actor, .actor { fill: #313244 !important; stroke: #9399b2 !important; }
  /* Actor text */
  text.actor, text.actor > tspan, .actor-box { fill: #cdd6f4 !important; }
  /* Actor lifelines */
  .actor-line, line.actor-line { stroke: #89b4fa !important; }
  /* Message lines/arrows */
  .messageLine0, .messageLine1, line.messageLine0, line.messageLine1 { stroke: #89b4fa !important; }
  /* Message text */
  .messageText, text.messageText { fill: #cdd6f4 !important; }
  /* Arrowheads */
  marker path, defs marker path, #arrowhead path { fill: #89b4fa !important; stroke: #89b4fa !important; }
  /* Note boxes */
  .note, rect.note { fill: #313244 !important; stroke: #6c7086 !important; }
  .noteText, .noteText > tspan { fill: #cdd6f4 !important; }
  /* Label boxes */
  .labelBox, rect.labelBox { fill: #1e1e2e !important; stroke: #6c7086 !important; }
  .labelText, .labelText > tspan { fill: #cdd6f4 !important; }
  /* Loop text */
  .loopText, .loopText > tspan { fill: #a6adc8 !important; }
  /* Activation boxes */
  .activation0, .activation1, .activation2 { fill: #45475a !important; stroke: #6c7086 !important; }
  /* General text fallback */
  text, text > tspan, tspan { fill: #cdd6f4 !important; }
}
</style>
`;
    // Insert before closing </svg> tag
    svg = svg.replace(/<\/svg>\s*$/, darkModeCSS + '</svg>');
    writeFileSync(outputFile, svg);

    console.log(`  ✓ ${hash}.svg (rendered)`);
  } catch (error) {
    console.error(`  ✗ ${hash}.svg failed:`, error.message);
  } finally {
    try {
      unlinkSync(inputFile);
      // rmdir is deprecated, use fs.rm in newer Node versions
      execSync(`rm -rf "${tempDir}"`);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Process all markdown files and render mermaid diagrams
 */
function processMarkdownFiles() {
  console.log("Rendering mermaid diagrams...\n");

  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith(".md"));
  let totalDiagrams = 0;

  for (const file of files) {
    const filepath = join(CONTENT_DIR, file);
    const content = readFileSync(filepath, "utf-8");
    const matches = [...content.matchAll(MERMAID_REGEX)];

    if (matches.length > 0) {
      console.log(`${file}:`);
      for (const match of matches) {
        const mermaidCode = match[1].trim();
        const hash = getHash(mermaidCode);
        renderMermaid(mermaidCode, hash);
        totalDiagrams++;
      }
    }
  }

  console.log(`\nProcessed ${totalDiagrams} diagram(s) from ${files.length} file(s)`);
}

processMarkdownFiles();
