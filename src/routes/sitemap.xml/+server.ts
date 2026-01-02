import { loadBlogPosts } from "$lib/blog";
import { SITE_URL } from "$lib/constants";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const posts = loadBlogPosts();

  // Define static pages with their priorities and change frequencies
  const staticPages = [
    { url: "", priority: "1.0", changefreq: "weekly" }, // Home page
    { url: "about", priority: "0.8", changefreq: "monthly" },
    { url: "blog", priority: "0.9", changefreq: "weekly" },
    { url: "projects", priority: "0.8", changefreq: "monthly" },
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}/${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
${posts
  .map(
    (post) => `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
