<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;

  interface Star {
    x: number;
    y: number;
    size: number;
    baseOpacity: number;
    twinkleSpeed: number;
    twinkleOffset: number;
    type: "small" | "medium" | "large" | "diamond";
  }

  let stars: Star[] = [];
  let time = 0;

  // Create star path for rendering
  function createStarPath(x: number, y: number, size: number) {
    const path = new Path2D();
    // Four-pointed star with simplified shape
    path.moveTo(x, y - size); // Top
    path.lineTo(x + size * 0.16, y - size * 0.2); // Top-right curve
    path.lineTo(x + size, y); // Right
    path.lineTo(x + size * 0.16, y + size * 0.2); // Bottom-right curve
    path.lineTo(x, y + size); // Bottom
    path.lineTo(x - size * 0.16, y + size * 0.2); // Bottom-left curve
    path.lineTo(x - size, y); // Left
    path.lineTo(x - size * 0.16, y - size * 0.2); // Top-left curve
    path.closePath();
    return path;
  }

  function generateStars() {
    const newStars: Star[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Generate stars in batches for better performance
    const starConfigs = [
      {
        count: 512,
        sizeRange: [0.5, 1],
        opacity: [0.3, 0.6],
        type: "small" as const,
      },
      {
        count: 256,
        sizeRange: [1, 2],
        opacity: [0.4, 0.7],
        type: "medium" as const,
      },
      {
        count: 128,
        sizeRange: [2, 3],
        opacity: [0.5, 0.8],
        type: "large" as const,
      },
      {
        count: 64,
        sizeRange: [4, 6],
        opacity: [0.8, 1],
        type: "diamond" as const,
      },
    ];

    for (const config of starConfigs) {
      for (let i = 0; i < config.count; i++) {
        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size:
            config.sizeRange[0] +
            Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
          baseOpacity:
            config.opacity[0] +
            Math.random() * (config.opacity[1] - config.opacity[0]),
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          type: config.type,
        });
      }
    }

    return newStars;
  }

  function draw() {
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Batch stars by type for better performance
    const starsByType = stars.reduce(
      (acc, star) => {
        if (!acc[star.type]) acc[star.type] = [];
        acc[star.type].push(star);
        return acc;
      },
      {} as Record<string, Star[]>,
    );

    // Draw each type in batches
    for (const [type, typeStars] of Object.entries(starsByType)) {
      ctx.save();

      // Set up common properties for this star type
      if (type === "diamond") {
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(200, 220, 255, 0.6)";
      }

      for (const star of typeStars) {
        // Calculate twinkle effect
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill(createStarPath(star.x, star.y, star.size));
      }

      ctx.restore();
    }

    time += 0.01;
    animationFrame = requestAnimationFrame(draw);
  }

  function handleResize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = generateStars();
  }

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    handleResize();
    draw();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<canvas bind:this={canvas} class="starfield-canvas"></canvas>

<style>
  .starfield-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -10;
  }
</style>
