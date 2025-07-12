<script lang="ts">
  import { HERO_CONTENT } from '$lib/constants';
</script>

<section class="min-h-screen flex items-center justify-center pt-16">
  <div class="container mx-auto px-4 py-20">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Logo with WebP optimization and high-DPI support -->
      <picture class="block mb-8">
        <!-- WebP format for desktop with high-DPI support -->
        <source
          media="(min-width: 768px)"
          srcset="/logo-384.webp 1x, /logo-768.webp 2x"
          type="image/webp"
        />
        <!-- WebP format for mobile with high-DPI support -->
        <source
          media="(max-width: 767px)"
          srcset="/logo-256.webp 1x, /logo-512.webp 2x"
          type="image/webp"
        />
        <!-- Fallback to PNG for older browsers -->
        <img 
          src="/logo.png" 
          alt="Stars and Manifolds Logo" 
          class="w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full shadow-lg"
          width="384"
          height="384"
          loading="eager"
        />
      </picture>
      
      <!-- Greeting -->
      <p class="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
        {HERO_CONTENT.greeting}
      </p>
      
      <!-- Name with gradient -->
      <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
        {HERO_CONTENT.name}
      </h1>
    </div>
  </div>
</section>