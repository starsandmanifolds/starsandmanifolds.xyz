<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { ABOUT_CONTENT, SITE_CONFIG, SITE_URL } from "$lib/constants";

  const canonicalUrl = `${SITE_URL}/about`;
  const description = "About Stars and Manifolds - Software engineer with a background in Physics, Mathematics, and AI.";
</script>

<svelte:head>
  <title>About - {SITE_CONFIG.name}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content="About - {SITE_CONFIG.name}" />
  <meta property="og:description" content={description} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content="About - {SITE_CONFIG.name}" />
  <meta property="twitter:description" content={description} />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="prose prose-xl dark:prose-invert max-w-none">
          {#each ABOUT_CONTENT.paragraphs as paragraph}
            <p
              class="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6"
            >
              {paragraph}
            </p>
          {/each}
        </div>
      </div>
    </div>
  </main>

  <Footer />
</div>
