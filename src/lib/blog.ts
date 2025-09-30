import type { BlogPost } from "./types";
import matter from "gray-matter";
import { parseMarkdown } from "./markdown";

// Import all markdown files from the blog directory as raw text
const blogFiles = import.meta.glob("/src/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export function loadBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const path in blogFiles) {
    const rawContent = blogFiles[path] as string;
    const filename = path.split("/").pop() || "";

    // Extract date and slug from filename
    // Format: YYYY-MM-DD-slug-name.md
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!match) continue;

    const [, date, slugWithHyphens] = match;

    // Parse frontmatter and content
    const { data: metadata, content } = matter(rawContent);

    // Skip posts that are not in a published state
    if (metadata.state !== "published") continue;

    posts.push({
      title: metadata.title || "Untitled",
      date: date,
      excerpt: metadata.excerpt || "",
      slug: slugWithHyphens,
      tags: metadata.tags || [],
      state: metadata.state,
      content: content, // Include raw markdown content for search
    });
  }

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// Cache slug-to-path mapping for O(1) lookup
let slugToPathCache: Map<string, string> | null = null;

function getSlugToPathMap(): Map<string, string> {
  if (!slugToPathCache) {
    slugToPathCache = new Map();
    for (const path in blogFiles) {
      const filename = path.split("/").pop() || "";
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      if (match) {
        const [, , slugFromFilename] = match;
        slugToPathCache.set(slugFromFilename, path);
      }
    }
  }
  return slugToPathCache;
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  const slugToPath = getSlugToPathMap();
  const path = slugToPath.get(slug);

  if (!path) {
    return null;
  }

  const rawContent = blogFiles[path] as string;
  const filename = path.split("/").pop() || "";

  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!match) {
    return null;
  }

  const [, date] = match;

  // Parse frontmatter and content
  const { data: metadata, content } = matter(rawContent);

  // Skip posts that are not in a published state
  if (metadata.state !== "published") {
    return null;
  }

  // Convert markdown to HTML
  const html = await parseMarkdown(content);

  return {
    title: metadata.title || "Untitled",
    date: date,
    excerpt: metadata.excerpt || "",
    slug: slug,
    tags: metadata.tags || [],
    state: metadata.state,
    content: html,
  };
}
