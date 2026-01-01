<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/constants";
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

<Seo
  title={data.post.title}
  description={data.post.excerpt}
  {canonicalUrl}
  type="article"
/>

<svelte:head>
  <!-- KaTeX CSS for math rendering (only loaded on blog posts) -->
  <link rel="stylesheet" href="/katex/katex.min.css" />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="grow pt-24 pb-16">
    <article class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Post header -->
        <header class="mb-8">
          <h1
            class="text-3xl font-bold mb-4 text-ctp-text"
          >
            {data.post.title}
          </h1>

          <div
            class="flex items-center gap-4 text-ctp-subtext1"
          >
            <time>{data.post.date}</time>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-4">
            {#each data.post.tags as tag}
              <span
                class="px-3 py-1 text-sm rounded-full bg-ctp-surface0 text-ctp-text"
              >
                {tag}
              </span>
            {/each}
          </div>
        </header>

        <!-- Post content -->
        <div
          class="prose prose-lg max-w-none"
        >
          {#if data.post.content}
            {@html data.post.content}
          {:else}
            <p
              class="text-xl text-ctp-subtext1 leading-relaxed"
            >
              {data.post.excerpt}
            </p>
          {/if}
        </div>

        <!-- Back to blog link -->
        <div class="mt-12">
          <a
            href="/blog"
            class="text-ctp-mauve hover:text-ctp-pink font-medium transition-colors inline-flex items-center"
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
