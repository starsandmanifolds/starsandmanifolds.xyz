<script lang="ts">
  import { SITE_CONFIG } from "$lib/constants";

  interface Props {
    title: string;
    description: string;
    canonicalUrl: string;
    type?: "website" | "article";
  }

  let { title, description, canonicalUrl, type = "website" }: Props = $props();

  const fullTitle = title.includes(SITE_CONFIG.name)
    ? title
    : `${title} - ${SITE_CONFIG.name}`;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={fullTitle} />
  <meta property="twitter:description" content={description} />
</svelte:head>
