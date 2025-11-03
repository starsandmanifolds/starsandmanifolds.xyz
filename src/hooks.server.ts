import { dev } from "$app/environment";

export async function handle({ event, resolve }) {
  if (
    dev &&
    event.url.pathname === "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return new Response(undefined, { status: 404 });
  }

  const response = await resolve(event);

  // Add security headers in production
  // Note: For prerendered pages on Cloudflare Pages:
  // - CSP is injected via <meta> tags (see svelte.config.js)
  // - Other headers come from _headers file
  // These headers serve as fallback for any future dynamic routes
  if (!dev) {
    // CSP is now handled by svelte.config.js (injects via <meta> tags)
    // Don't set CSP header here to avoid conflicts

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "interest-cohort=()",
      ].join(", ")
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  }

  return response;
}
