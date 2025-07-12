<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG } from "$lib/constants";
  import { loadBlogPosts } from "$lib/blog";
  
  const blogPosts = loadBlogPosts();
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
</script>

<svelte:head>
  <title>Blog - {SITE_CONFIG.name}</title>
  <meta name="description" content="Blog posts about software engineering, technology, and more." />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  
  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
          Blog
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-12">
          Thoughts on software engineering, technology, and the intersection of code with mathematics and physics.
        </p>
        
        {#if blogPosts.length > 0}
          <ul class="space-y-6">
            {#each blogPosts as post}
              <li class="border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <div class="grid grid-cols-[auto_1fr] gap-4">
                  <time class="text-sm text-neutral-500 dark:text-neutral-500 whitespace-nowrap pt-0.5">
                    {formatDate(post.date)}
                  </time>
                  <div class="space-y-2">
                    <a 
                      href="/blog/{post.slug}"
                      class="group"
                    >
                      <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h2>
                    </a>
                    {#if post.excerpt}
                      <p class="text-neutral-600 dark:text-neutral-400">
                        {post.excerpt}
                      </p>
                    {/if}
                    {#if post.tags && post.tags.length > 0}
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each post.tags as tag}
                          <span class="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm">
                            {tag}
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="text-center py-24">
            <p class="text-neutral-500 dark:text-neutral-500 text-lg">
              No blog posts yet. Check back soon!
            </p>
          </div>
        {/if}
      </div>
    </div>
  </main>
  
  <Footer />
</div>