<script lang="ts">
  import type { BlogPost } from '$lib/types';
  
  export let post: BlogPost;
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
</script>

<article class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow duration-200">
  <div class="flex flex-col h-full">
    <!-- Date -->
    <time class="text-sm text-neutral-500 dark:text-neutral-500 mb-2">
      {formatDate(post.date)}
    </time>
    
    <!-- Title -->
    <h3 class="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
      <a href="/blog/{post.slug}" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        {post.title}
      </a>
    </h3>
    
    <!-- Excerpt -->
    <p class="text-neutral-600 dark:text-neutral-400 mb-4 flex-grow">
      {post.excerpt}
    </p>
    
    <!-- Tags -->
    <div class="flex flex-wrap gap-2 mb-4">
      {#each post.tags as tag}
        <span class="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          {tag}
        </span>
      {/each}
    </div>
    
    <!-- Read more link -->
    <a 
      href="/blog/{post.slug}" 
      class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors inline-flex items-center"
    >
      Read more
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 ml-1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </a>
  </div>
</article>