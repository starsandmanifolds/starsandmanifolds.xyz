import { loadProjects } from "$lib/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  const projects = loadProjects();

  return {
    projects,
  };
};