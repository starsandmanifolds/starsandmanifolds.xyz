<script lang="ts">
  import { onMount } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/constants";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const canonicalUrl = `${SITE_URL}/blog/${data.post.slug}`;

  // Check if content has mermaid diagrams (for preload hint)
  const hasMermaid = data.post.content?.includes('class="mermaid"') ?? false;

  // Catppuccin theme variables for mermaid
  const THEME_DARK = {
    // General
    primaryColor: "#313244",
    primaryTextColor: "#cdd6f4",
    primaryBorderColor: "#9399b2",
    lineColor: "#89b4fa",
    secondaryColor: "#45475a",
    tertiaryColor: "#1e1e2e",
    textColor: "#cdd6f4",
    mainBkg: "#1e1e2e",
    nodeBorder: "#9399b2",
    // Sequence diagrams
    actorBorder: "#9399b2",
    actorBkg: "#313244",
    actorTextColor: "#cdd6f4",
    actorLineColor: "#89b4fa",
    signalColor: "#89b4fa",
    signalTextColor: "#cdd6f4",
    noteBorderColor: "#6c7086",
    noteBkgColor: "#313244",
    noteTextColor: "#cdd6f4",
    // Flowcharts
    clusterBkg: "#1e1e2e",
    clusterBorder: "#9399b2",
    edgeLabelBackground: "#313244",
    nodeTextColor: "#cdd6f4",
    nodeBkg: "#313244",
    // Flowchart node fills (fill0-8 for different depths)
    fill0: "#313244",
    fill1: "#313244",
    fill2: "#313244",
    fill3: "#313244",
    fill4: "#313244",
  };

  const THEME_LIGHT = {
    // General
    primaryColor: "#ccd0da",
    primaryTextColor: "#4c4f69",
    primaryBorderColor: "#6c6f85",
    lineColor: "#5c5f77",
    secondaryColor: "#e6e9ef",
    tertiaryColor: "#eff1f5",
    textColor: "#4c4f69",
    mainBkg: "#eff1f5",
    nodeBorder: "#6c6f85",
    // Sequence diagrams
    actorBorder: "#6c6f85",
    actorBkg: "#dce0e8",
    actorTextColor: "#4c4f69",
    actorLineColor: "#5c5f77",
    signalColor: "#5c5f77",
    signalTextColor: "#4c4f69",
    noteBorderColor: "#6c6f85",
    noteBkgColor: "#e6e9ef",
    noteTextColor: "#4c4f69",
    // Flowcharts
    clusterBkg: "#eff1f5",
    clusterBorder: "#6c6f85",
    edgeLabelBackground: "#e6e9ef",
    nodeTextColor: "#4c4f69",
    nodeBkg: "#dce0e8",
    // Flowchart node fills (fill0-8 for different depths)
    fill0: "#dce0e8",
    fill1: "#dce0e8",
    fill2: "#dce0e8",
    fill3: "#dce0e8",
    fill4: "#dce0e8",
  };

  // Lazy-load mermaid.js only if the page contains mermaid diagrams
  onMount(() => {
    const mermaidElements = Array.from(document.querySelectorAll("pre.mermaid"));
    if (mermaidElements.length === 0) return;

    // Store original mermaid code for re-rendering on theme change
    const originalCode = new Map<Element, string>();
    mermaidElements.forEach((el) => {
      originalCode.set(el, el.textContent || "");
    });

    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let isRendering = false;
    let cleanup = () => {};

    // Initialize mermaid and render (async IIFE)
    (async () => {
      // Dynamically import mermaid (self-hosted)
      const mermaidUrl = new URL("/mermaid/mermaid.esm.min.mjs", window.location.origin).href;
      const mermaid = await import(/* @vite-ignore */ mermaidUrl);

      // Render diagrams with current theme
      async function renderDiagrams(isDark: boolean) {
        if (isRendering) return;
        isRendering = true;
        try {
          mermaid.default.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: isDark ? THEME_DARK : THEME_LIGHT,
            fontFamily: "Inter, system-ui, sans-serif",
          });
          await mermaid.default.run({ nodes: mermaidElements });

          // Chrome bug: SVG markers in <defs> don't paint on initial render of
          // dynamically inserted content. Workaround: wait for browser idle
          // (after paint completes), then force repaint. Firefox is unaffected.
          // See: https://bugs.chromium.org/p/chromium/issues/detail?id=109212
          requestIdleCallback(() => {
            mermaidElements.forEach((el) => {
              const svg = el.querySelector("svg");
              if (svg) {
                svg.style.transform = "translateZ(0)";
                svg.getBoundingClientRect(); // Force reflow
                svg.style.transform = "";
              }
            });
          });
        } finally {
          isRendering = false;
        }
      }

      // Initial render
      await renderDiagrams(colorSchemeQuery.matches);

      // Re-render on theme change
      const handleThemeChange = async (e: MediaQueryListEvent) => {
        mermaidElements.forEach((el) => {
          const code = originalCode.get(el);
          if (code) {
            el.innerHTML = code;
            el.removeAttribute("data-processed");
          }
        });
        await renderDiagrams(e.matches);
      };

      colorSchemeQuery.addEventListener("change", handleThemeChange);

      // Store cleanup reference
      cleanup = () => colorSchemeQuery.removeEventListener("change", handleThemeChange);
    })();

    return () => cleanup();
  });

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

  <!-- Preload mermaid.js for faster diagram rendering -->
  {#if hasMermaid}
    <link rel="modulepreload" href="/mermaid/mermaid.esm.min.mjs" />
  {/if}

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
