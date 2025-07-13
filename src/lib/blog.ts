import type { BlogPost } from "./types";

// Import all markdown files from the blog directory
const blogFiles = import.meta.glob("/src/content/blog/*.md", { eager: true });

export function loadBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const path in blogFiles) {
    const file = blogFiles[path] as any;
    const filename = path.split("/").pop() || "";

    // Extract date and slug from filename
    // Format: YYYY-MM-DD-slug-name.md
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!match) continue;

    const [, date, slugWithHyphens] = match;

    // The metadata from front matter
    const metadata = file.metadata || {};

    posts.push({
      title: metadata.title || "Untitled",
      date: metadata.date || date,
      excerpt: metadata.excerpt || "",
      slug: slugWithHyphens,
      tags: metadata.tags || [],
    });
  }

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function loadBlogPost(slug: string) {
  // Try to find a markdown file that matches the slug
  for (const path in blogFiles) {
    if (path.includes(slug)) {
      const file = blogFiles[path] as any;
      const filename = path.split("/").pop() || "";

      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      if (!match) continue;

      const [, date] = match;
      const metadata = file.metadata || {};

      return {
        title: metadata.title || "Untitled",
        date: metadata.date || date,
        excerpt: metadata.excerpt || "",
        slug: slug,
        tags: metadata.tags || [],
        content: file.default, // The rendered component
      };
    }
  }

  return null;
}
