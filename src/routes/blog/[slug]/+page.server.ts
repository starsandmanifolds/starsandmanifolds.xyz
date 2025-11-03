import { error } from "@sveltejs/kit";
import { loadBlogPost } from "$lib/blog";
import type { PageServerLoad } from "./$types";
import type { EntryGenerator } from "./$types";
import { loadBlogPosts } from "$lib/blog";

export const prerender = true;

export const entries: EntryGenerator = () => {
  const posts = loadBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = await loadBlogPost(params.slug);

  if (!post) {
    error(404, "Blog post not found");
  }

  return {
    post,
  };
};