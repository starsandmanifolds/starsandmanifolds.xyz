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
    colorString?: string; // Pre-computed color string
    spectralClass: string;
    temperature: number;
    distance: number; // in parsecs
    absoluteMagnitude: number;
    apparentMagnitude: number;
    path?: Path2D; // Pre-computed path
  }

  let stars: Star[] = [];
  let time = 0;
  let isVisible = true; // Track visibility state
  let resizeTimeout: number;
  
  // Pre-create reusable paths for each star type
  const starPaths = new Map<string, Path2D>();

  // Stellar classifications with temperature ranges and absolute magnitudes
  const stellarTypes = [
    {
      class: "M",
      probability: 0.7645,
      tempRange: [2400, 3700],
      colorRange: [
        { r: 255, g: 180, b: 60 }, // Coolest M9 (deep red-orange)
        { r: 255, g: 210, b: 130 }, // Hottest M0 (orange-red)
      ],
      absoluteMagRange: [9, 7], // Main sequence M dwarfs, adjusted for visibility
    },
    {
      class: "K",
      probability: 0.121,
      tempRange: [3700, 5200],
      colorRange: [
        { r: 255, g: 210, b: 140 }, // Coolest K9
        { r: 255, g: 230, b: 190 }, // Hottest K0
      ],
      absoluteMagRange: [7, 5],
    },
    {
      class: "G",
      probability: 0.076,
      tempRange: [5200, 6000],
      colorRange: [
        { r: 255, g: 235, b: 200 }, // Coolest G9 (yellow-orange)
        { r: 255, g: 248, b: 240 }, // Hottest G0 (white-yellow)
      ],
      absoluteMagRange: [5.5, 4], // Sun is ~4.83
    },
    {
      class: "F",
      probability: 0.03,
      tempRange: [6000, 7500],
      colorRange: [
        { r: 255, g: 250, b: 245 }, // Coolest F9
        { r: 240, g: 245, b: 255 }, // Hottest F0
      ],
      absoluteMagRange: [4, 2.5],
    },
    {
      class: "A",
      probability: 0.006,
      tempRange: [7500, 10000],
      colorRange: [
        { r: 225, g: 235, b: 255 }, // Coolest A9
        { r: 190, g: 210, b: 255 }, // Hottest A0
      ],
      absoluteMagRange: [2.5, 0.5],
    },
    {
      class: "B",
      probability: 0.0013,
      tempRange: [10000, 30000],
      colorRange: [
        { r: 185, g: 205, b: 255 }, // Coolest B9
        { r: 160, g: 180, b: 255 }, // Hottest B0
      ],
      absoluteMagRange: [0.5, -2], // Bright, but not supergiant bright
    },
    {
      class: "O",
      probability: 0.00003,
      tempRange: [30000, 50000],
      colorRange: [
        { r: 155, g: 176, b: 255 }, // Coolest O9
        { r: 145, g: 165, b: 255 }, // Hottest O0
      ],
      absoluteMagRange: [-2, -4], // Very bright, but reasonable
    },
  ];

  // Interpolate between two colors based on temperature
  function interpolateColor(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    t: number,
  ): { r: number; g: number; b: number } {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t),
    };
  }

  // Get a random star color based on realistic stellar distribution
  function getStarProperties(): {
    color: { r: number; g: number; b: number };
    spectralClass: string;
    temperature: number;
    absoluteMagnitude: number;
  } {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const starType of stellarTypes) {
      cumulativeProbability += starType.probability;
      if (random <= cumulativeProbability) {
        // Generate random temperature within the star class range
        const tempPosition = Math.random(); // 0 = coolest, 1 = hottest
        const temperature =
          starType.tempRange[0] +
          (starType.tempRange[1] - starType.tempRange[0]) * tempPosition;

        // Interpolate color based on temperature position
        const color = interpolateColor(
          starType.colorRange[0],
          starType.colorRange[1],
          tempPosition,
        );

        // Interpolate absolute magnitude based on temperature
        const absoluteMagnitude =
          starType.absoluteMagRange[0] +
          (starType.absoluteMagRange[1] - starType.absoluteMagRange[0]) *
            tempPosition;

        return {
          color,
          spectralClass: starType.class,
          temperature,
          absoluteMagnitude,
        };
      }
    }

    // Fallback (should never reach here)
    const fallback = stellarTypes[0];
    return {
      color: { ...fallback.colorRange[0] },
      spectralClass: fallback.class,
      temperature: fallback.tempRange[0],
      absoluteMagnitude: fallback.absoluteMagRange[0],
    };
  }

  // Generate realistic distance distribution
  // Most stars we see are within a few hundred parsecs
  function generateStarDistance(): number {
    // Use a power law distribution - closer stars are more likely to be visible
    // Most visible stars are within 300 parsecs
    const u = Math.random();
    // Heavily favor closer stars - use cube for stronger bias
    return Math.pow(u, 3) * 300 + 5; // parsecs (minimum 5 parsecs)
  }

  // Calculate apparent magnitude from absolute magnitude and distance
  function calculateApparentMagnitude(
    absoluteMag: number,
    distance: number,
  ): number {
    // m = M + 5 * log10(d) - 5
    return absoluteMag + 5 * Math.log10(distance) - 5;
  }

  // Create star path for rendering - optimized with caching
  function getOrCreateStarPath(size: number): Path2D {
    const cacheKey = size.toFixed(2);
    let path = starPaths.get(cacheKey);
    
    if (!path) {
      path = new Path2D();
      // Four-pointed star centered at origin
      path.moveTo(0, -size); // Top
      path.lineTo(size * 0.16, -size * 0.2); // Top-right curve
      path.lineTo(size, 0); // Right
      path.lineTo(size * 0.16, size * 0.2); // Bottom-right curve
      path.lineTo(0, size); // Bottom
      path.lineTo(-size * 0.16, size * 0.2); // Bottom-left curve
      path.lineTo(-size, 0); // Left
      path.lineTo(-size * 0.16, -size * 0.2); // Top-left curve
      path.closePath();
      starPaths.set(cacheKey, path);
    }
    
    return path;
  }

  function generateStars() {
    const newStars: Star[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Generate stars with realistic apparent magnitude distribution
    // Human eye can see stars up to magnitude 6.5 in perfect conditions
    const starCounts = [
      {
        count: 10,
        magRange: [-1.5, 0],
        sizeRange: [6, 8],
        opacityRange: [0.95, 1],
      }, // Brightest stars (Sirius, Canopus, etc.)
      {
        count: 30,
        magRange: [0, 1.5],
        sizeRange: [4, 6],
        opacityRange: [0.85, 0.95],
      }, // Very bright stars
      {
        count: 80,
        magRange: [1.5, 2.5],
        sizeRange: [3, 4],
        opacityRange: [0.7, 0.85],
      }, // Bright stars
      {
        count: 200,
        magRange: [2.5, 3.5],
        sizeRange: [2, 3],
        opacityRange: [0.5, 0.7],
      }, // Medium stars
      {
        count: 400,
        magRange: [3.5, 4.5],
        sizeRange: [1.5, 2],
        opacityRange: [0.35, 0.5],
      }, // Faint stars
      {
        count: 600,
        magRange: [4.5, 5.5],
        sizeRange: [1, 1.5],
        opacityRange: [0.25, 0.35],
      }, // Very faint stars
      {
        count: 300,
        magRange: [5.5, 6],
        sizeRange: [0.7, 1],
        opacityRange: [0.15, 0.25],
      }, // Barely visible
    ];

    for (const config of starCounts) {
      for (let i = 0; i < config.count; i++) {
        const starProps = getStarProperties();

        // Generate apparent magnitude in the specified range
        const apparentMag =
          config.magRange[0] +
          Math.random() * (config.magRange[1] - config.magRange[0]);

        // Calculate distance that would give this apparent magnitude
        // m - M = 5 log10(d) - 5, so d = 10^((m - M + 5)/5)
        let distance = Math.pow(
          10,
          (apparentMag - starProps.absoluteMagnitude + 5) / 5,
        );

        // Clamp distance to reasonable values (1 to 1000 parsecs)
        distance = Math.max(1, Math.min(1000, distance));

        // Recalculate actual apparent magnitude with clamped distance
        const actualApparentMag = calculateApparentMagnitude(
          starProps.absoluteMagnitude,
          distance,
        );

        // Skip if star would be invisible
        if (actualApparentMag > 6.5) continue;

        const size =
          config.sizeRange[0] +
          Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
        const baseOpacity =
          config.opacityRange[0] +
          Math.random() * (config.opacityRange[1] - config.opacityRange[0]);

        let type: "small" | "medium" | "large" | "diamond";
        if (size > 5) type = "diamond";
        else if (size > 3) type = "large";
        else if (size > 1.5) type = "medium";
        else type = "small";

        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseOpacity,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          type,
          color: starProps.color,
          colorString: `${starProps.color.r},${starProps.color.g},${starProps.color.b}`, // Pre-compute color string
          spectralClass: starProps.spectralClass,
          temperature: starProps.temperature,
          distance,
          absoluteMagnitude: starProps.absoluteMagnitude,
          apparentMagnitude: actualApparentMag,
          path: getOrCreateStarPath(size), // Pre-compute path
        });
      }
    }

    console.log(`Generated ${newStars.length} visible stars`);
    console.log(
      `Sample stars:`,
      newStars.slice(0, 5).map((s) => ({
        class: s.spectralClass,
        absMag: s.absoluteMagnitude.toFixed(2),
        distance: s.distance.toFixed(1),
        appMag: s.apparentMagnitude.toFixed(2),
        size: s.size.toFixed(2),
      })),
    );

    // Sort by apparent magnitude so dimmer stars are drawn first
    newStars.sort((a, b) => b.apparentMagnitude - a.apparentMagnitude);

    return newStars;
  }

  // Pre-group stars by type for better performance
  let starsByType: Record<string, Star[]> = {};

  function draw() {
    if (!ctx || !canvas || !isVisible) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each type in batches
    for (const [type, typeStars] of Object.entries(starsByType)) {
      // Skip if no stars of this type
      if (!typeStars.length) continue;
      
      // Set shadow once per type
      ctx.save();
      
      if (type === "diamond") {
        ctx.shadowBlur = 6;
      } else if (type === "large") {
        ctx.shadowBlur = 3;
      } else {
        ctx.shadowBlur = 0;
      }

      // Batch similar opacity stars together to reduce state changes
      let lastOpacity = -1;
      
      for (const star of typeStars) {
        // Calculate twinkle effect
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = Math.round((star.baseOpacity * (0.5 + twinkle * 0.5)) * 100) / 100; // Round to 2 decimals

        // Only update fillStyle if opacity changed significantly
        if (Math.abs(opacity - lastOpacity) > 0.05) {
          ctx.fillStyle = `rgba(${star.colorString}, ${opacity})`;
          
          // Set shadow color only for glowing stars
          if (ctx.shadowBlur > 0) {
            ctx.shadowColor = `rgba(${star.colorString}, ${opacity * 0.5})`;
          }
          lastOpacity = opacity;
        }

        // Draw using pre-computed path with translation
        ctx.translate(star.x, star.y);
        ctx.fill(star.path!);
        ctx.translate(-star.x, -star.y);
      }
      
      ctx.restore();
    }

    time += 0.01;
    animationFrame = requestAnimationFrame(draw);
  }

  function groupStars(starArray: Star[]) {
    starsByType = starArray.reduce(
      (acc, star) => {
        if (!acc[star.type]) acc[star.type] = [];
        acc[star.type].push(star);
        return acc;
      },
      {} as Record<string, Star[]>,
    );
  }

  function handleResize() {
    if (!canvas) return;
    
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = generateStars();
      groupStars(stars);
    }, 150);
  }

  onMount(() => {
    ctx = canvas.getContext("2d")!; // Keep alpha enabled to show background color
    
    // Generate and group stars immediately
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = generateStars();
    groupStars(stars);
    
    // Start animation
    draw();

    // Handle visibility changes to pause animation when not visible
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !animationFrame) {
        draw();
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(resizeTimeout);
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
