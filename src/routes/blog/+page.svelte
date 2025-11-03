<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG, SITE_URL } from "$lib/constants";
  import { formatDate } from "$lib/utils/date";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let searchQuery = $state("");

  // Helper function to split text into highlighted and non-highlighted parts
  // Returns array of {text: string, highlighted: boolean} objects
  function splitTextForHighlight(text: string, query: string): Array<{text: string, highlighted: boolean}> {
    if (!query.trim()) return [{text, highlighted: false}];

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts: Array<{text: string, highlighted: boolean}> = [];

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add non-highlighted text before the match
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          highlighted: false
        });
      }

      // Add highlighted match
      parts.push({
        text: match[0],
        highlighted: true
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining non-highlighted text
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false
      });
    }

    return parts;
  }

  // Helper function to extract content snippet with search term
  function getContentSnippet(content: string, query: string, maxLength: number = 150): string | null {
    if (!content || !query.trim()) return null;

    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) return null;

    // Get text around the match
    const start = Math.max(0, index - 60);
    const end = Math.min(content.length, index + query.length + 90);

    let snippet = content.substring(start, end);

    // Add ellipsis if needed
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  // Use $derived.by for computed/filtered posts
  const filteredPosts = $derived.by(() => {
    if (!searchQuery.trim()) {
      return data.posts;
    }

    const query = searchQuery.toLowerCase();
    return data.posts.filter(post => {
      const inTitle = post.title.toLowerCase().includes(query);
      const inExcerpt = post.excerpt.toLowerCase().includes(query);
      const inTags = post.tags.some(tag => tag.toLowerCase().includes(query));
      const inContent = post.content ? post.content.toLowerCase().includes(query) : false;
      return inTitle || inExcerpt || inTags || inContent;
    });
  });
</script>

<svelte:head>
  <title>Blog - {SITE_CONFIG.name}</title>
  <meta
    name="description"
    content="Blog posts about software engineering, technology, and more."
  />
  <link rel="canonical" href="{SITE_URL}/blog" />
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
              onclick={() => searchQuery = ''}
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
              onclick={() => searchQuery = ''}
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
                        {#if searchQuery}
                          {#each splitTextForHighlight(post.title, searchQuery) as part}
                            {#if part.highlighted}
                              <mark class="bg-yellow-200 dark:bg-yellow-600">{part.text}</mark>
                            {:else}
                              {part.text}
                            {/if}
                          {/each}
                        {:else}
                          {post.title}
                        {/if}
                      </h2>
                    </a>
                    {#if post.excerpt}
                      <p class="text-neutral-600 dark:text-neutral-400">
                        {#if searchQuery}
                          {#each splitTextForHighlight(post.excerpt, searchQuery) as part}
                            {#if part.highlighted}
                              <mark class="bg-yellow-200 dark:bg-yellow-600">{part.text}</mark>
                            {:else}
                              {part.text}
                            {/if}
                          {/each}
                        {:else}
                          {post.excerpt}
                        {/if}
                      </p>
                    {/if}
                    {#if searchQuery && post.content}
                      {@const snippet = getContentSnippet(post.content, searchQuery)}
                      {#if snippet}
                        <div class="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                          <p class="text-sm text-neutral-600 dark:text-neutral-400 italic">
                            {#each splitTextForHighlight(snippet, searchQuery) as part}
                              {#if part.highlighted}
                                <mark class="bg-yellow-200 dark:bg-yellow-600">{part.text}</mark>
                              {:else}
                                {part.text}
                              {/if}
                            {/each}
                          </p>
                        </div>
                      {/if}
                    {/if}
                    {#if post.tags && post.tags.length > 0}
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each post.tags as tag}
                          <span
                            class="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                          >
                            {#if searchQuery}
                              {#each splitTextForHighlight(tag, searchQuery) as part}
                                {#if part.highlighted}
                                  <mark class="bg-yellow-200 dark:bg-yellow-600">{part.text}</mark>
                                {:else}
                                  {part.text}
                                {/if}
                              {/each}
                            {:else}
                              {tag}
                            {/if}
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
