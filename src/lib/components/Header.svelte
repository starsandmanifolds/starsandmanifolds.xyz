<script lang="ts">
  import { NAV_ITEMS, SITE_CONFIG } from '$lib/constants';
  import ThemeToggle from './ThemeToggle.svelte';
  
  let mobileMenuOpen = false;
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header class="fixed top-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 z-50">
  <div class="container mx-auto px-4">
    <nav class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="text-4xl font-decorative font-bold text-neutral-900 dark:text-neutral-100">
        {SITE_CONFIG.name}
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {#each NAV_ITEMS as item}
          <a 
            href={item.href}
            class="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {item.label}
          </a>
        {/each}
        <ThemeToggle />
      </div>
      
      <!-- Mobile Menu Button -->
      <div class="md:hidden flex items-center space-x-4">
        <ThemeToggle />
        <button
          on:click={toggleMobileMenu}
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            {#if mobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            {/if}
          </svg>
        </button>
      </div>
    </nav>
    
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4">
        {#each NAV_ITEMS as item}
          <a 
            href={item.href}
            on:click={() => mobileMenuOpen = false}
            class="block py-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {item.label}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</header>