// Shared headers config - single source of truth for dev and prod

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

// Path-specific cache headers (only apply in prod via _headers)
export const cacheRules: Array<{ path: string; headers: Record<string, string> }> = [
  {
    path: '/_app/immutable/*',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
  {
    path: '/logo*.webp',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
  {
    path: '/*.woff2',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
  {
    path: '/katex/*',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
  {
    path: '/mermaid/*',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },
  {
    path: '/*.html',
    headers: { 'Cache-Control': 'public, max-age=3600, must-revalidate' },
  },
];

// Generate Cloudflare Pages _headers file content
export function generateHeadersFile(): string {
  const lines: string[] = [
    '# Auto-generated from src/lib/headers.ts - do not edit directly',
    '# Note: CSP is handled by SvelteKit via <meta> tags (see svelte.config.js)',
    '',
    '/*',
  ];

  for (const [key, value] of Object.entries(securityHeaders)) {
    lines.push(`  ${key}: ${value}`);
  }

  for (const rule of cacheRules) {
    lines.push('', rule.path);
    for (const [key, value] of Object.entries(rule.headers)) {
      lines.push(`  ${key}: ${value}`);
    }
  }

  return lines.join('\n') + '\n';
}
