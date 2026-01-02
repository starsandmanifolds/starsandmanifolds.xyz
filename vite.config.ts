import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { execSync } from 'child_process';
import { securityHeaders } from './src/lib/headers';

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
    sveltekit()
  ],
  define: {
    '__GIT_COMMIT_HASH__': JSON.stringify(getGitCommitHash()),
  },
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
});
