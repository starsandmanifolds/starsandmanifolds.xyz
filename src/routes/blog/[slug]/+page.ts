import { error } from "@sveltejs/kit";
import { loadBlogPost } from "$lib/blog";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const post = await loadBlogPost(params.slug);

  if (!post) {
    throw error(404, "Blog post not found");
  }

  return {
    post,
  };
};
