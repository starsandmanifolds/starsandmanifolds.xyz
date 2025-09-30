import type { Project } from "./types";
import matter from "gray-matter";
import { parseMarkdown } from "./markdown";

// Import all markdown files from the projects directory as raw text
const projectFiles = import.meta.glob("/src/content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export function loadProjects(): Project[] {
  const projects: Project[] = [];

  for (const path in projectFiles) {
    const rawContent = projectFiles[path] as string;
    const filename = path.split("/").pop() || "";

    // Skip README files
    if (filename.toLowerCase() === "readme.md") continue;

    // Extract slug from filename (remove .md extension)
    const slug = filename.replace(/\.md$/, "");

    // Parse frontmatter and content
    const { data: metadata, content } = matter(rawContent);

    // Skip projects that are not in a published state
    if (metadata.state !== "published") continue;

    projects.push({
      title: metadata.title || "Untitled Project",
      description: metadata.description || "",
      technologies: metadata.technologies || [],
      slug: slug,
      state: metadata.state,
      githubUrl: metadata.githubUrl,
      liveUrl: metadata.liveUrl,
      blogPostSlug: metadata.blogPostSlug,
      order: metadata.order,
      content: content, // Raw markdown for detail page
    });
  }

  // Sort by order (if specified), then alphabetically by title
  return projects.sort((a, b) => {
    // If both have order numbers, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one has an order, put it first
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // Otherwise, sort alphabetically by title
    return a.title.localeCompare(b.title);
  });
}

// Cache slug-to-path mapping for O(1) lookup
let slugToPathCache: Map<string, string> | null = null;

function getSlugToPathMap(): Map<string, string> {
  if (!slugToPathCache) {
    slugToPathCache = new Map();
    for (const path in projectFiles) {
      const filename = path.split("/").pop() || "";
      if (filename.toLowerCase() === "readme.md") continue;
      const slug = filename.replace(/\.md$/, "");
      slugToPathCache.set(slug, path);
    }
  }
  return slugToPathCache;
}

export async function loadProject(slug: string): Promise<Project | null> {
  const slugToPath = getSlugToPathMap();
  const path = slugToPath.get(slug);

  if (!path) {
    return null;
  }

  const rawContent = projectFiles[path] as string;

  // Parse frontmatter and content
  const { data: metadata, content } = matter(rawContent);

  // Skip projects that are not in a published state
  if (metadata.state !== "published") {
    return null;
  }

  // Convert markdown to HTML
  const html = await parseMarkdown(content);

  return {
    title: metadata.title || "Untitled Project",
    description: metadata.description || "",
    technologies: metadata.technologies || [],
    slug: slug,
    state: metadata.state,
    githubUrl: metadata.githubUrl,
    liveUrl: metadata.liveUrl,
    blogPostSlug: metadata.blogPostSlug,
    order: metadata.order,
    content: html,
  };
}