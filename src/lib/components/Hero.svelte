<script lang="ts">
  import { HERO_CONTENT } from '$lib/constants';
</script>

<section class="min-h-screen flex items-center justify-center pt-16">
  <div class="container mx-auto px-4 py-20">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Logo -->
      <img 
        src="/logo.png" 
        alt="Stars and Manifolds Logo" 
        class="w-96 h-96 mx-auto mb-8 rounded-full shadow-lg"
      />
      
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