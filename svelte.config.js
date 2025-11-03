import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte"],

  preprocess: [vitePreprocess()],

  kit: {
    adapter: adapter(),
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'https://static.cloudflareinsights.com'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self'],
        'connect-src': ['self', 'https://cloudflareinsights.com'],
        'frame-ancestors': ['none']
      }
    }
  },
};

export default config;
