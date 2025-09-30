import type { Project } from "./types";
import matter from "gray-matter";

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

    // Parse frontmatter only (ignore content)
    const { data: metadata } = matter(rawContent);

    // Skip projects that are not in a published state
    if (metadata.state !== "published") continue;

    projects.push({
      title: metadata.title || "Untitled Project",
      description: metadata.description || "",
      technologies: metadata.technologies || [],
      state: metadata.state,
      githubUrl: metadata.githubUrl,
      liveUrl: metadata.liveUrl,
      blogPostSlug: metadata.blogPostSlug,
      order: metadata.order,
      imageUrl: metadata.imageUrl,
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