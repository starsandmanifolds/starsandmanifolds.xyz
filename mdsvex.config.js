import { escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import remarkMath from 'remark-math';
import rehypeKatexSvelte from 'rehype-katex-svelte';

let highlighter;

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
      if (!highlighter) {
        highlighter = await createHighlighter({
          themes: ['github-dark'],
          langs: ['javascript', 'typescript', 'csharp', 'cpp', 'python', 'bash', 'json', 'markdown', 'css', 'html', 'text']
        });
      }
      
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'github-dark' }));
      return `{@html \`${html}\`}`;
    }
  }
};

export default config;