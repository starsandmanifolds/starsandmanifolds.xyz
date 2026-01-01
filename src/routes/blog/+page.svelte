<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/constants";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let searchQuery = $state("");
  let searchInput: HTMLInputElement;

  function hasModifiers(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
  }

  /**
   * Global keyboard shortcut handler
   * - "/" focuses the search input (when not already typing)
   * - "Escape" clears the search query (first press), then blurs the input (second press)
   */
  function handleGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isTyping =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

    // Focus search with "/"
    if (event.key === '/' && !isTyping && !hasModifiers(event)) {
      event.preventDefault();
      searchInput?.focus();
      return;
    }

    // Clear/blur search with "Escape"
    if (event.key === 'Escape' && target === searchInput) {
      // Don't interfere with IME composition
      if (event.isComposing) return;

      event.preventDefault();

      if (searchQuery.trim()) {
        // First press: clear the query
        searchQuery = '';
      } else {
        // Second press: blur the input
        searchInput?.blur();
      }
    }
  }

  // Split text into highlighted and non-highlighted parts for search results
  function splitTextForHighlight(text: string, query: string): Array<{text: string, highlighted: boolean}> {
    if (!query.trim()) return [{text, highlighted: false}];

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Split with capturing group keeps matches in the result array
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

    return parts
      .filter(Boolean)
      .map(part => ({
        text: part,
        highlighted: part.toLowerCase() === query.toLowerCase()
      }));
  }

  // Helper function to extract content snippet with search term
  function getContentSnippet(content: string, query: string): string | null {
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

<svelte:window onkeydown={handleGlobalKeydown} />

<Seo
  title="Blog"
  description="Blog posts about software engineering, technology, and more."
  canonicalUrl="{SITE_URL}/blog"
/>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-ctp-subtext1 mb-8">
          Thoughts on software engineering, technology, and the intersection of
          code with mathematics and physics.
        </p>
        
        <!-- Search Box -->
        <div class="group relative mb-12">
          <input
            bind:this={searchInput}
            type="text"
            bind:value={searchQuery}
            placeholder="Search posts by title, content, or tags..."
            class="w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-ctp-surface1 bg-ctp-surface0 text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:border-transparent transition-colors"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-ctp-overlay0"
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
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-ctp-overlay0 hover:text-ctp-text transition-colors"
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
          {:else}
            <kbd
              class="absolute right-4 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-ctp-text border border-ctp-surface1 rounded bg-ctp-surface0 shadow-sm pointer-events-none group-focus-within:hidden"
              aria-hidden="true"
            >
              /
            </kbd>
          {/if}
        </div>

        {#if searchQuery && filteredPosts.length === 0}
          <div class="text-center py-24">
            <p class="text-ctp-subtext1 text-lg">
              No posts found matching "{searchQuery}"
            </p>
            <button
              onclick={() => searchQuery = ''}
              class="mt-4 text-ctp-mauve hover:underline"
            >
              Clear search
            </button>
          </div>
        {:else if filteredPosts.length > 0}
          {#if searchQuery}
            <p class="text-sm text-ctp-subtext1 mb-6">
              Found {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'} matching "{searchQuery}"
            </p>
          {/if}
          <ul class="space-y-6">
            {#each filteredPosts as post}
              <li
                class="border-b border-ctp-surface0 pb-6"
              >
                <div class="grid grid-cols-[auto_1fr] gap-4">
                  <time
                    class="text-sm text-ctp-subtext1 whitespace-nowrap pt-0.5"
                  >
                    {post.date}
                  </time>
                  <div class="space-y-2">
                    <a href="/blog/{post.slug}" class="group">
                      <h2
                        class="text-xl font-medium text-ctp-text group-hover:text-ctp-mauve transition-colors"
                      >
                        {#if searchQuery}
                          {#each splitTextForHighlight(post.title, searchQuery) as part}
                            {#if part.highlighted}
                              <mark class="bg-ctp-yellow/30 text-ctp-text">{part.text}</mark>
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
                      <p class="text-ctp-subtext1">
                        {#if searchQuery}
                          {#each splitTextForHighlight(post.excerpt, searchQuery) as part}
                            {#if part.highlighted}
                              <mark class="bg-ctp-yellow/30 text-ctp-text">{part.text}</mark>
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
                        <div class="mt-3 p-3 bg-ctp-surface0/50 rounded-lg border border-ctp-surface1">
                          <p class="text-sm text-ctp-subtext1 italic">
                            {#each splitTextForHighlight(snippet, searchQuery) as part}
                              {#if part.highlighted}
                                <mark class="bg-ctp-yellow/30 text-ctp-text">{part.text}</mark>
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
                            class="px-3 py-1 rounded-lg bg-ctp-surface0 border border-ctp-surface1 text-xs font-medium text-ctp-text shadow-sm"
                          >
                            {#if searchQuery}
                              {#each splitTextForHighlight(tag, searchQuery) as part}
                                {#if part.highlighted}
                                  <mark class="bg-ctp-yellow/30 text-ctp-text">{part.text}</mark>
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
            <p class="text-ctp-subtext1 text-lg">
              No blog posts yet. Check back soon!
            </p>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <Footer />
</div>
