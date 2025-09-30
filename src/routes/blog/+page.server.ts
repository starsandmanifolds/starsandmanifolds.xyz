import { loadBlogPosts } from "$lib/blog";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async () => {
  const posts = loadBlogPosts();

  return {
    posts,
  };
};