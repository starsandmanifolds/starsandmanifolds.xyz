<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG, SITE_URL } from "$lib/constants";
  import { formatDate } from "$lib/utils/date";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const canonicalUrl = `${SITE_URL}/blog/${data.post.slug}`;

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.post.title,
    "description": data.post.excerpt,
    "datePublished": data.post.date,
    "author": {
      "@type": "Person",
      "name": "Anand Shankar Dyavanapalli",
      "url": SITE_URL
    },
    "keywords": data.post.tags.join(", "),
    "url": canonicalUrl
  };
</script>

<svelte:head>
  <title>{data.post.title} - {SITE_CONFIG.name}</title>
  <meta name="description" content={data.post.excerpt} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.post.excerpt} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={data.post.title} />
  <meta property="twitter:description" content={data.post.excerpt} />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <article class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Post header -->
        <header class="mb-8">
          <h1
            class="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100"
          >
            {data.post.title}
          </h1>

          <div
            class="flex items-center gap-4 text-neutral-600 dark:text-neutral-400"
          >
            <time>{formatDate(data.post.date)}</time>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-4">
            {#each data.post.tags as tag}
              <span
                class="px-3 py-1 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                {tag}
              </span>
            {/each}
          </div>
        </header>

        <!-- Post content -->
        <div
          class="prose prose-lg dark:prose-invert max-w-none prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:text-neutral-100"
        >
          {#if data.post.content}
            {@html data.post.content}
          {:else}
            <p
              class="text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed"
            >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 mr-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to all posts
          </a>
        </div>
      </div>
    </article>
  </main>

  <Footer />
</div>
