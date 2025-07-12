<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SITE_CONFIG } from "$lib/constants";
</script>

<svelte:head>
  <title>Privacy Policy - {SITE_CONFIG.name}</title>
  <meta
    name="description"
    content="Privacy Policy for {SITE_CONFIG.name} - How we protect and handle your personal information."
  />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Privacy Policy
      </h1>

      <div class="prose prose-lg dark:prose-invert max-w-none">
        <p class="text-neutral-600 dark:text-neutral-400">
          <strong>Last updated:</strong> January 1, 2024
        </p>

        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Overview
          </h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            This website is a personal portfolio and blog. We respect your privacy and are committed to protecting any personal information you may share with us.
          </p>
        </section>

        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Information We Collect
          </h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            We do not actively collect any personal information. This is a static website with no user accounts, forms, or tracking mechanisms.
          </p>
        </section>

        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Contact Information
          </h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            If you have any questions about this Privacy Policy, please contact us at {SITE_CONFIG.email}.
          </p>
        </section>
      </div>
    </div>
  </main>

  <Footer />
</div>