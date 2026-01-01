<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Starfield from "$lib/components/Starfield.svelte";
  import { page } from "$app/state";

  // Get error information from page store
  const status = $derived(page.status);
  const message = $derived(page.error?.message || "An unexpected error occurred");

  // Custom titles for common error codes
  const errorTitles: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Page Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout"
  };

  const errorTitle = $derived(errorTitles[status] || "Error");

  // Friendly messages for common error codes
  const friendlyMessages: Record<number, string> = {
    404: "The page you're looking for seems to have wandered off into the void. Let's get you back on track.",
    500: "Something went wrong on our end. We're working on fixing it. Please try again later.",
    503: "The site is temporarily unavailable. We'll be back up soon!"
  };

  const friendlyMessage = $derived(friendlyMessages[status]);
</script>

<svelte:head>
  <title>{status} - {errorTitle} | Stars and Manifolds</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header follows OS theme preference -->
  <Header />
  <!-- Starfield hero section -->
  <div class="starfield-section grow relative">
    <Starfield />
    <main class="grow flex items-center justify-center px-4 py-16 relative z-10">
        <div class="max-w-2xl w-full text-center">
          <!-- Error Status Code -->
          <div class="mb-8">
            <h1 class="text-8xl md:text-9xl font-bold text-ctp-mauve mb-4">
              {status}
            </h1>
            <h2 class="text-3xl md:text-4xl font-bold text-ctp-text mb-6">
              {errorTitle}
            </h2>
          </div>

          <!-- Error Message -->
          <div class="mb-8">
            {#if friendlyMessage}
              <p class="text-lg text-ctp-subtext1 mb-4">
                {friendlyMessage}
              </p>
            {/if}
            {#if message && !friendlyMessage}
              <p class="text-base text-ctp-subtext1 font-mono">
                {message}
              </p>
            {/if}
          </div>

          <!-- Gradient divider -->
          <div class="divider-space my-8 mx-auto max-w-md"></div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/"
              class="inline-flex items-center px-6 py-3 bg-ctp-mauve hover:bg-ctp-mauve/80 text-ctp-crust font-semibold rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              Go Home
            </a>
            <button
              onclick={() => window.history.back()}
              class="inline-flex items-center px-6 py-3 bg-ctp-surface0 hover:bg-ctp-surface1 text-ctp-text font-semibold rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              Go Back
            </button>
          </div>

          {#if status === 404}
            <!-- Additional help for 404 errors -->
            <div class="mt-12 text-left max-w-md mx-auto">
              <h3 class="text-xl font-semibold text-ctp-text mb-4">
                Looking for something specific?
              </h3>
              <ul class="space-y-3 text-ctp-subtext1">
                <li>
                  <a href="/blog" class="text-ctp-mauve hover:text-ctp-pink underline">
                    Browse the blog
                  </a>
                  for articles on physics, math, and software engineering
                </li>
                <li>
                  <a href="/about" class="text-ctp-mauve hover:text-ctp-pink underline">
                    Learn more about me
                  </a>
                  and my work
                </li>
                <li>
                  <a href="/#contact" class="text-ctp-mauve hover:text-ctp-pink underline">
                    Get in touch
                  </a>
                  if you need help finding something
                </li>
              </ul>
            </div>
          {/if}
        </div>
      </main>
  </div>
  <!-- Footer follows OS theme preference -->
  <Footer />
</div>
