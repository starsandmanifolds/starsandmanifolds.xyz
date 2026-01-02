import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import { createHighlighter, type Highlighter } from "shiki";

let highlighterInstance: Highlighter | null = null;
let markedInitialized = false;
let initPromise: Promise<void> | null = null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      // Load both themes for light/dark mode support
      // catppuccin-latte needs color replacements for WCAG AA compliance
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      langs: [
        "bash",
        "cpp",
        "csharp",
        "css",
        "haskell",
        "html",
        "ini",
        "javascript",
        "json",
        "latex",
        "markdown",
        "python",
        "rust",
        "text",
        "toml",
        "typescript",
      ],
    });
  }
  return highlighterInstance;
}

async function initializeMarked(): Promise<void> {
  if (markedInitialized) {
    return;
  }

  // Ensure only one initialization happens (prevent race conditions)
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const highlighter = await getHighlighter();

    // Configure KaTeX extension
    marked.use(
      markedKatex({
        throwOnError: false,
        output: "html",
        macros: {
          "\\vec": "\\mathbf",
          "\\RR": "\\mathbb{R}",
          "\\CC": "\\mathbb{C}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
        },
      }),
    );

    // Configure custom renderers
    marked.use({
      async: true,
      renderer: {
        heading(token) {
          const id = slugify(token.text);
          const content = this.parser.parseInline(token.tokens);
          return `<h${token.depth} id="${id}">${content}</h${token.depth}>\n`;
        },
        code(token) {
          const code = token.text;
          const lang = token.lang || "text";

          // Handle Mermaid diagrams - output raw code for client-side rendering
          if (lang === "mermaid") {
            return `<pre class="mermaid">${code}</pre>`;
          }

          try {
            // Use dual themes - Shiki outputs CSS variables for both themes
            // defaultColor: false means NO inline color fallbacks, only CSS variables
            // This lets CSS handle theme switching cleanly without !important
            // colorReplacements darkens catppuccin-latte colors for WCAG AA (4.5:1)
            return highlighter.codeToHtml(code, {
              lang,
              themes: {
                light: "catppuccin-latte",
                dark: "catppuccin-mocha",
              },
              defaultColor: false,
              colorReplacements: {
                // Catppuccin Latte colors darkened for WCAG AA compliance
                // Original colors have 2.3-4.3:1 contrast, these achieve 4.5:1+
                "#dc8a78": "#975f52", // rosewater
                "#dd7878": "#a35858", // flamingo
                "#ea76cb": "#a1518c", // pink
                "#e64553": "#c53b47", // maroon
                "#fe640b": "#bb4a08", // peach
                "#df8e1d": "#996114", // yellow
                "#40a02b": "#317c21", // green
                "#179299": "#137a80", // teal
                "#04a5e5": "#0275a2", // sky
                "#209fb5": "#187889", // sapphire
                "#1e66f5": "#1d63f0", // blue
                "#7287fd": "#5767c2", // lavender
                "#7c7f93": "#6a6d7e", // overlay2 (comments)
              },
            });
          } catch (error) {
            console.warn(`Failed to highlight ${lang}:`, error);
            // Fallback to plain code block
            const escaped = code
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
            return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
          }
        },
      },
    });

    markedInitialized = true;
  })();

  return initPromise;
}

export async function parseMarkdown(content: string): Promise<string> {
  await initializeMarked();

  try {
    return await marked.parse(content);
  } catch (error) {
    console.error("Markdown parsing error:", error);
    // Return a formatted error message instead of throwing
    return `<div class="error-message p-4 my-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
      <p class="font-bold text-red-700 dark:text-red-400">Error rendering content</p>
      <pre class="mt-2 text-sm text-red-600 dark:text-red-300">${error instanceof Error ? error.message : "Unknown error"}</pre>
    </div>`;
  }
}