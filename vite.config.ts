import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { execSync } from 'child_process';

// Get git commit hash at build time
function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    return 'unknown';
  }
}

export default defineConfig({
  plugins: [
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@fontsource/*/files/*',
          dest: '_app/immutable/assets/files'
        }
      ]
    })
  ],
  define: {
    '__GIT_COMMIT_HASH__': JSON.stringify(getGitCommitHash()),
  }
});
