import { error } from "@sveltejs/kit";
import { loadProject, loadProjects } from "$lib/projects";
import type { PageServerLoad, EntryGenerator } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => {
  const projects = loadProjects();
  return projects.map(project => ({ slug: project.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const project = await loadProject(params.slug);

  if (!project) {
    throw error(404, "Project not found");
  }

  return {
    project,
  };
};