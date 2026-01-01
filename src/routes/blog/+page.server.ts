import { loadBlogPosts } from "$lib/blog";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  const posts = loadBlogPosts();

  return {
    posts,
  };
};