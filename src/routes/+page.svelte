<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Starfield from "$lib/components/Starfield.svelte";
  import { SITE_CONFIG, SITE_URL } from "$lib/constants";

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Anand Shankar Dyavanapalli",
    "url": SITE_URL,
    "jobTitle": "Software Engineer",
    "description": SITE_CONFIG.description,
    "sameAs": [
      "https://github.com/adyavanapalli",
      "https://www.linkedin.com/in/adyavanapalli/"
    ],
    "knowsAbout": ["Software Engineering", "Physics", "Mathematics", "Artificial Intelligence"]
  };
</script>

<svelte:head>
  <title>{SITE_CONFIG.title}</title>
  <meta name="description" content={SITE_CONFIG.description} />
  <link rel="canonical" href={SITE_URL} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={SITE_URL} />
  <meta property="og:title" content={SITE_CONFIG.title} />
  <meta property="og:description" content={SITE_CONFIG.description} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={SITE_URL} />
  <meta property="twitter:title" content={SITE_CONFIG.title} />
  <meta property="twitter:description" content={SITE_CONFIG.description} />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen relative">
  <Starfield />
  <div class="min-h-screen flex flex-col relative z-10">
    <Header />
    <main class="flex-grow">
    </main>
    <Footer />
  </div>
</div>
