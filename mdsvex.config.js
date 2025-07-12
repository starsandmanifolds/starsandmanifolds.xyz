import { escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import remarkMath from 'remark-math';
import rehypeKatexSvelte from 'rehype-katex-svelte';

// Global singleton highlighter to prevent multiple instances
let highlighterInstance = null;
let isHighlighterInitializing = false;

async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance;
  }
  
  if (isHighlighterInitializing) {
    // Wait for the current initialization to complete
    while (isHighlighterInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return highlighterInstance;
  }
  
  isHighlighterInitializing = true;
  
  try {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'csharp', 'cpp', 'python', 'bash', 'json', 'markdown', 'css', 'html', 'text', 'rust', 'haskell']
    });
    return highlighterInstance;
  } finally {
    isHighlighterInitializing = false;
  }
}

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: ['.md'],
  remarkPlugins: [remarkMath],
  rehypePlugins: [
    [
      rehypeKatexSvelte,
      {
        // KaTeX options and macros
        macros: {
          "\\vec": "\\mathbf",
          "\\RR": "\\mathbb{R}",
          "\\CC": "\\mathbb{C}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
        },
        throwOnError: false,
        strict: false
      }
    ]
  ],
  highlight: {
    highlighter: async (code, lang = 'text') => {
      try {
        const highlighter = await getHighlighter();
        const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'github-dark' }));
        return `{@html \`${html}\`}`;
      } catch (error) {
        console.warn('Shiki highlighting failed for language:', lang, error);
        // Fallback to simple code block if Shiki fails
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    }
  }
};

export default config;