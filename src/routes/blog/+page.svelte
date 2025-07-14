<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG } from "$lib/constants";
  import { loadBlogPosts } from "$lib/blog";
  import type { BlogPost } from "$lib/types";

  const blogPosts = loadBlogPosts();
  let searchQuery = "";
  let filteredPosts: BlogPost[] = blogPosts;

  // Load blog content for search
  const blogFiles = import.meta.glob("/src/content/blog/*.md", { 
    eager: true,
    query: '?raw',
    import: 'default'
  });
  
  // Extract text content from markdown
  const postContents: Record<string, string> = {};
  for (const [path, content] of Object.entries(blogFiles)) {
    const filename = path.split('/').pop() || '';
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, , slug] = match;
      // Remove frontmatter and convert to plain text for searching
      const textContent = content
        .replace(/^---[\s\S]*?---\n/, '') // Remove frontmatter
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove display math
        .replace(/\$[^$]*?\$/g, '') // Remove inline math
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert links to text
        .replace(/[#*_`]/g, '') // Remove markdown formatting
        .toLowerCase();
      postContents[slug] = textContent;
    }
  }

  function searchPosts() {
    if (!searchQuery.trim()) {
      filteredPosts = blogPosts;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredPosts = blogPosts.filter(post => {
      // Search in title, excerpt, and tags
      const inTitle = post.title.toLowerCase().includes(query);
      const inExcerpt = post.excerpt.toLowerCase().includes(query);
      const inTags = post.tags.some(tag => tag.toLowerCase().includes(query));
      
      // Search in content
      const inContent = postContents[post.slug]?.includes(query) || false;
      
      return inTitle || inExcerpt || inTags || inContent;
    });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  $: searchQuery, searchPosts();
</script>

<svelte:head>
  <title>Blog - {SITE_CONFIG.name}</title>
  <meta
    name="description"
    content="Blog posts about software engineering, technology, and more."
  />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
          Thoughts on software engineering, technology, and the intersection of
          code with mathematics and physics.
        </p>
        
        <!-- Search Box -->
        <div class="relative mb-12">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search posts by title, content, or tags..."
            class="w-full px-4 py-3 pl-12 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {#if searchQuery}
            <button
              on:click={() => searchQuery = ''}
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>

        {#if searchQuery && filteredPosts.length === 0}
          <div class="text-center py-24">
            <p class="text-neutral-600 dark:text-neutral-400 text-lg">
              No posts found matching "{searchQuery}"
            </p>
            <button
              on:click={() => searchQuery = ''}
              class="mt-4 text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear search
            </button>
          </div>
        {:else if filteredPosts.length > 0}
          {#if searchQuery}
            <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Found {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'} matching "{searchQuery}"
            </p>
          {/if}
          <ul class="space-y-6">
            {#each filteredPosts as post}
              <li
                class="border-b border-neutral-200 dark:border-neutral-800 pb-6"
              >
                <div class="grid grid-cols-[auto_1fr] gap-4">
                  <time
                    class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap pt-0.5"
                  >
                    {formatDate(post.date)}
                  </time>
                  <div class="space-y-2">
                    <a href="/blog/{post.slug}" class="group">
                      <h2
                        class="text-xl font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                      >
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
                          <span
                            class="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                          >
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
            <p class="text-neutral-600 dark:text-neutral-400 text-lg">
              No blog posts yet. Check back soon!
            </p>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <Footer />
</div>
