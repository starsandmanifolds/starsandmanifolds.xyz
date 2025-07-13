<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import StarfieldProgrammatic from "$lib/components/StarfieldProgrammatic.svelte";
  import { SITE_CONFIG } from "$lib/constants";
</script>

<svelte:head>
  <title>{SITE_CONFIG.title}</title>
  <meta name="description" content={SITE_CONFIG.description} />
  <meta property="og:title" content={SITE_CONFIG.title} />
  <meta property="og:description" content={SITE_CONFIG.description} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={SITE_CONFIG.title} />
  <meta name="twitter:description" content={SITE_CONFIG.description} />
</svelte:head>

<div class="min-h-screen relative">
  <StarfieldProgrammatic />
  <div class="min-h-screen flex flex-col relative z-10">
    <Header />
    <main class="flex-grow">
      <Hero />
    </main>
    <Footer />
  </div>
</div>