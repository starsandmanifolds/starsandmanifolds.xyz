<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let container: HTMLDivElement;
  let stars: HTMLDivElement[] = [];

  interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    animationDelay: number;
    driftSpeed: number;
  }

  // Generate random stars
  function generateStars(): Star[] {
    const starData: Star[] = [];

    // Small stars: 128
    for (let i = 0; i < 128; i++) {
      starData.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.3,
        animationDelay: Math.random() * 3,
        driftSpeed: 0.1 + Math.random() * 0.2,
      });
    }

    // Medium stars: 64
    for (let i = 0; i < 64; i++) {
      starData.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 2 + Math.random() * 1,
        opacity: 0.4 + Math.random() * 0.3,
        animationDelay: Math.random() * 4,
        driftSpeed: 0.15 + Math.random() * 0.15,
      });
    }

    // Large stars: 32
    for (let i = 0; i < 32; i++) {
      starData.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 3 + Math.random() * 1.5,
        opacity: 0.5 + Math.random() * 0.3,
        animationDelay: Math.random() * 5,
        driftSpeed: 0.05 + Math.random() * 0.1,
      });
    }

    // Diamond stars: 16
    for (let i = 0; i < 16; i++) {
      starData.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 8 + Math.random() * 4,
        opacity: 0.8 + Math.random() * 0.2,
        animationDelay: Math.random() * 3,
        driftSpeed: 0,
      });
    }

    return starData;
  }

  function createStarElement(star: Star): HTMLDivElement {
    const starEl = document.createElement("div");
    starEl.className = "star";
    starEl.style.left = `${star.x}px`;
    starEl.style.top = `${star.y}px`;
    starEl.style.width = `${star.size}px`;
    starEl.style.height = `${star.size}px`;
    starEl.style.opacity = `${star.opacity}`;
    starEl.style.animationDelay = `${star.animationDelay}s`;

    // Add size-based class for different animations
    if (star.size <= 1.5) {
      starEl.classList.add("star-small");
    } else if (star.size <= 3) {
      starEl.classList.add("star-medium");
    } else if (star.size <= 4.5) {
      starEl.classList.add("star-large");
    } else {
      starEl.classList.add("star-diamond");
    }

    // Add drift speed as CSS variable
    starEl.style.setProperty("--drift-speed", `${star.driftSpeed}`);

    return starEl;
  }

  onMount(() => {
    const starData = generateStars();

    starData.forEach((star) => {
      const starEl = createStarElement(star);
      container.appendChild(starEl);
      stars.push(starEl);
    });

    // Simple resize handler - removed expensive viewport culling
    const handleResize = () => {
      // Optionally regenerate stars on resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stars.forEach((star) => star.remove());
    };
  });

  onDestroy(() => {
    stars.forEach((star) => star.remove());
  });
</script>

<div bind:this={container} class="starfield-container"></div>

<style>
  .starfield-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: -10;
    contain: layout style paint;
  }

  :global(.star) {
    position: absolute;
    background: white;
    /* GPU acceleration hints */
    will-change: transform, opacity;
    transform: translateZ(0); /* Force GPU layer */
    backface-visibility: hidden; /* Optimize for animations */
    /* Simplified four-pointed star shape for better performance */
    clip-path: polygon(
      50% 0%,
      58% 40%,
      100% 50%,
      58% 60%,
      50% 100%,
      42% 60%,
      0% 50%,
      42% 40%
    );
  }

  /* Twinkling animations */
  :global(.star-small) {
    animation: twinkle-small 3s ease-in-out infinite;
  }

  :global(.star-medium) {
    animation: twinkle-medium 4s ease-in-out infinite;
  }

  :global(.star-large) {
    animation: twinkle-large 5s ease-in-out infinite;
  }

  :global(.star-diamond) {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))
      drop-shadow(0 0 4px rgba(200, 220, 255, 0.6));
    animation: twinkle-diamond 3s ease-in-out infinite;
  }

  @keyframes twinkle-small {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes twinkle-medium {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.9;
    }
  }

  @keyframes twinkle-large {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes twinkle-diamond {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
</style>
