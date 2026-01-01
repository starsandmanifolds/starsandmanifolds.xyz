<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Starfield from "$lib/components/Starfield.svelte";
  import Seo from "$lib/components/Seo.svelte";
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

<Seo
  title={SITE_CONFIG.title}
  description={SITE_CONFIG.description}
  canonicalUrl={SITE_URL}
/>

<svelte:head>
  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header follows OS theme preference -->
  <Header />
  <!-- Starfield hero section -->
  <div class="starfield-section grow relative">
    <Starfield />
    <main class="grow relative z-10">
    </main>
  </div>
  <!-- Footer follows OS theme preference -->
  <Footer />
</div>
