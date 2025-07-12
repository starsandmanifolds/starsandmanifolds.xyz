<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG } from "$lib/constants";
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
</script>

<svelte:head>
  <title>{data.post.title} - {SITE_CONFIG.name}</title>
  <meta name="description" content={data.post.excerpt} />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  
  <main class="flex-grow pt-24 pb-16">
    <article class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Post header -->
        <header class="mb-8">
          <h1 class="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            {data.post.title}
          </h1>
          
          <div class="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
            <time>{formatDate(data.post.date)}</time>
          </div>
          
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-4">
            {#each data.post.tags as tag}
              <span class="px-3 py-1 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {tag}
              </span>
            {/each}
          </div>
        </header>
        
        <!-- Post content -->
        <div class="prose prose-lg dark:prose-invert mx-auto max-w-none prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:text-neutral-100">
          {#if data.post.content}
            <svelte:component this={data.post.content} />
          {:else}
            <p class="text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {data.post.excerpt}
            </p>
          {/if}
        </div>
        
        <!-- Back to blog link -->
        <div class="mt-12">
          <a 
            href="/blog" 
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to all posts
          </a>
        </div>
      </div>
    </article>
  </main>
  
  <Footer />
</div>