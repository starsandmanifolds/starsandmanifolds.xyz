<script lang="ts">
  import { NAV_ITEMS, SITE_CONFIG } from "$lib/constants";
  import { page } from "$app/state";

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function isActive(itemHref: string): boolean {
    const pathname = page.url.pathname;
    // Exact match for homepage
    if (itemHref === "/" && pathname === "/") return true;
    // For other pages, check if pathname starts with the href
    if (itemHref !== "/" && pathname.startsWith(itemHref)) return true;
    return false;
  }
</script>

<header class="fixed top-0 w-full bg-ctp-base z-50">
  <div class="container mx-auto px-4">
    <nav class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="text-4xl font-decorative font-bold text-ctp-text">
        {SITE_CONFIG.name}
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {#each NAV_ITEMS as item}
          <a
            href={item.href}
            class="text-ctp-subtext1 hover:text-ctp-mauve transition-colors {isActive(item.href) ? 'text-ctp-mauve border-b-2 border-ctp-mauve' : ''}"
          >
            {item.label}
          </a>
        {/each}
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button
          onclick={toggleMobileMenu}
          class="p-2 rounded-lg hover:bg-ctp-surface0 transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            {#if mobileMenuOpen}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            {:else}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            {/if}
          </svg>
        </button>
      </div>
    </nav>
  </div>

  <!-- Gradient divider at bottom of header -->
  <div class="divider-space"></div>

  <div class="container mx-auto px-4">
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div id="mobile-menu" class="md:hidden border-t border-ctp-surface0 py-4">
        {#each NAV_ITEMS as item}
          <a
            href={item.href}
            onclick={() => (mobileMenuOpen = false)}
            class="block py-2 text-ctp-subtext1 hover:text-ctp-mauve transition-colors {isActive(item.href) ? 'text-ctp-mauve' : ''}"
          >
            {item.label}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</header>
