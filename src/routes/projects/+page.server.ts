import { loadProjects } from "$lib/projects";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async () => {
  const projects = loadProjects();

  return {
    projects,
  };
};