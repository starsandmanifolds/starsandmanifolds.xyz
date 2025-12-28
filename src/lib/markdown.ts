import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import { createHighlighter, type Highlighter } from "shiki";

let highlighterInstance: Highlighter | null = null;
let markedInitialized = false;
let initPromise: Promise<void> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ["catppuccin-mocha"],
      langs: [
        "bash",
        "cpp",
        "csharp",
        "css",
        "haskell",
        "html",
        "javascript",
        "json",
        "latex",
        "markdown",
        "python",
        "rust",
        "text",
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

    // Configure custom code renderer with Shiki
    marked.use({
      async: true,
      renderer: {
        code(token) {
          const code = token.text;
          const lang = token.lang || "text";

          try {
            return highlighter.codeToHtml(code, {
              lang,
              theme: "catppuccin-mocha",
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