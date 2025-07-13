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
    color: { r: number; g: number; b: number };
    spectralClass: string;
  }

  let stars: Star[] = [];
  let time = 0;

  // Stellar classifications with temperature ranges
  const stellarTypes = [
    { 
      class: 'M', 
      probability: 0.7645, 
      tempRange: [2400, 3700],
      colorRange: [
        { r: 255, g: 180, b: 60 },   // Coolest M9 (deep red-orange)
        { r: 255, g: 210, b: 130 }   // Hottest M0 (orange-red)
      ]
    },
    { 
      class: 'K', 
      probability: 0.121, 
      tempRange: [3700, 5200],
      colorRange: [
        { r: 255, g: 210, b: 140 },  // Coolest K9
        { r: 255, g: 230, b: 190 }   // Hottest K0
      ]
    },
    { 
      class: 'G', 
      probability: 0.076, 
      tempRange: [5200, 6000],
      colorRange: [
        { r: 255, g: 235, b: 200 },  // Coolest G9 (yellow-orange)
        { r: 255, g: 248, b: 240 }   // Hottest G0 (white-yellow)
      ]
    },
    { 
      class: 'F', 
      probability: 0.03, 
      tempRange: [6000, 7500],
      colorRange: [
        { r: 255, g: 250, b: 245 },  // Coolest F9
        { r: 240, g: 245, b: 255 }   // Hottest F0
      ]
    },
    { 
      class: 'A', 
      probability: 0.006, 
      tempRange: [7500, 10000],
      colorRange: [
        { r: 225, g: 235, b: 255 },  // Coolest A9
        { r: 190, g: 210, b: 255 }   // Hottest A0
      ]
    },
    { 
      class: 'B', 
      probability: 0.0013, 
      tempRange: [10000, 30000],
      colorRange: [
        { r: 185, g: 205, b: 255 },  // Coolest B9
        { r: 160, g: 180, b: 255 }   // Hottest B0
      ]
    },
    { 
      class: 'O', 
      probability: 0.00003, 
      tempRange: [30000, 50000],
      colorRange: [
        { r: 155, g: 176, b: 255 },  // Coolest O9
        { r: 145, g: 165, b: 255 }   // Hottest O0
      ]
    }
  ];

  // Interpolate between two colors based on temperature
  function interpolateColor(color1: {r: number, g: number, b: number}, 
                          color2: {r: number, g: number, b: number}, 
                          t: number): {r: number, g: number, b: number} {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t)
    };
  }

  // Get a random star color based on realistic stellar distribution
  function getStarColor(): { color: { r: number; g: number; b: number }; spectralClass: string; temperature: number } {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const starType of stellarTypes) {
      cumulativeProbability += starType.probability;
      if (random <= cumulativeProbability) {
        // Generate random temperature within the star class range
        const tempPosition = Math.random(); // 0 = coolest, 1 = hottest
        const temperature = starType.tempRange[0] + 
                          (starType.tempRange[1] - starType.tempRange[0]) * tempPosition;
        
        // Interpolate color based on temperature position
        const color = interpolateColor(
          starType.colorRange[0], 
          starType.colorRange[1], 
          tempPosition
        );
        
        return {
          color,
          spectralClass: starType.class,
          temperature
        };
      }
    }
    
    // Fallback (should never reach here)
    const fallback = stellarTypes[0];
    return {
      color: { ...fallback.colorRange[0] },
      spectralClass: fallback.class,
      temperature: fallback.tempRange[0]
    };
  }

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
        const starColor = getStarColor();
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
          color: starColor.color,
          spectralClass: starColor.spectralClass,
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

      for (const star of typeStars) {
        // Calculate twinkle effect
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);

        // Set star color with opacity
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${opacity})`;
        
        // Add colored glow for larger/brighter stars
        if (star.type === "diamond" || star.type === "large") {
          ctx.shadowBlur = star.type === "diamond" ? 6 : 3;
          ctx.shadowColor = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${opacity * 0.5})`;
        } else {
          ctx.shadowBlur = 0;
        }
        
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
