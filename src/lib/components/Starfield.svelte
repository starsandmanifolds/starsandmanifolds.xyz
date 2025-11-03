<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext;
  let animationFrame: number;

  // WebGL resources
  let shaderProgram: WebGLProgram;
  let positionBuffer: WebGLBuffer;
  let sizeBuffer: WebGLBuffer;
  let colorBuffer: WebGLBuffer;
  let twinkleBuffer: WebGLBuffer;

  // Shader attribute/uniform locations
  let aPosition: number;
  let aSize: number;
  let aColor: number;
  let aTwinkleData: number;
  let uTime: WebGLUniformLocation;
  let uResolution: WebGLUniformLocation;

  interface Star {
    x: number;
    y: number;
    size: number;
    baseOpacity: number;
    twinkleSpeed: number;
    twinkleOffset: number;
    color: { r: number; g: number; b: number };
  }

  let stars: Star[] = [];
  let time = 0;
  let isVisible = true;
  let resizeTimeout: number;

  // Vertex shader - uses point sprites for efficiency
  const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute float aSize;
    attribute vec3 aColor;
    attribute vec3 aTwinkleData; // baseOpacity, twinkleSpeed, twinkleOffset

    uniform vec2 uResolution;
    uniform float uTime;

    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      // Calculate twinkle
      float twinkle = sin(uTime * aTwinkleData.y + aTwinkleData.z) * 0.5 + 0.5;
      vOpacity = aTwinkleData.x * (0.5 + twinkle * 0.5);
      vColor = aColor;

      // Convert to clip space
      vec2 clipSpace = ((aPosition / uResolution) * 2.0 - 1.0) * vec2(1, -1);

      gl_Position = vec4(clipSpace, 0.0, 1.0);
      gl_PointSize = aSize * 2.0; // Double size for better visibility
    }
  `;

  // Fragment shader - renders point sprites as stars
  const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      // Get coordinates from center of point sprite (-0.5 to 0.5)
      vec2 coord = gl_PointCoord - 0.5;
      float x = coord.x;
      float y = coord.y;

      // Create a four-pointed star using the astroid formula
      // |x|^(2/3) + |y|^(2/3) = r^(2/3)
      float r = 0.4; // Radius
      float absX = abs(x);
      float absY = abs(y);

      // Calculate if we're inside the astroid shape
      // Using a smaller exponent makes the curves more extreme
      float value = pow(absX/r, 0.5) + pow(absY/r, 0.5);

      // Create smooth edges
      float alpha = 1.0 - smoothstep(0.8, 1.2, value);

      // Add a glow that follows the star shape
      // Make the glow proportional to how close we are to the star shape
      float glowIntensity = exp(-value * 2.0) * 0.3;
      alpha = max(alpha, glowIntensity);

      // Apply opacity
      gl_FragColor = vec4(vColor, alpha * vOpacity);
    }
  `;

  // Stellar classifications with realistic color distributions
  const stellarTypes = [
    {
      probability: 0.7645,
      colorRange: [
        { r: 255, g: 180, b: 60 }, // Cool M-type (red-orange)
        { r: 255, g: 210, b: 130 }, // Warm M-type (orange-red)
      ],
    },
    {
      probability: 0.121,
      colorRange: [
        { r: 255, g: 210, b: 140 }, // Cool K-type
        { r: 255, g: 230, b: 190 }, // Warm K-type
      ],
    },
    {
      probability: 0.076,
      colorRange: [
        { r: 255, g: 235, b: 200 }, // Cool G-type (yellow-orange)
        { r: 255, g: 248, b: 240 }, // Warm G-type (white-yellow)
      ],
    },
    {
      probability: 0.03,
      colorRange: [
        { r: 255, g: 250, b: 245 }, // Cool F-type
        { r: 240, g: 245, b: 255 }, // Warm F-type
      ],
    },
    {
      probability: 0.006,
      colorRange: [
        { r: 225, g: 235, b: 255 }, // Cool A-type
        { r: 190, g: 210, b: 255 }, // Warm A-type
      ],
    },
    {
      probability: 0.0013,
      colorRange: [
        { r: 185, g: 205, b: 255 }, // Cool B-type
        { r: 160, g: 180, b: 255 }, // Warm B-type
      ],
    },
    {
      probability: 0.00003,
      colorRange: [
        { r: 155, g: 176, b: 255 }, // Cool O-type
        { r: 145, g: 165, b: 255 }, // Warm O-type
      ],
    },
  ];

  // Helper function to interpolate between two colors
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

  function getStarColor(): { r: number; g: number; b: number } {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const starType of stellarTypes) {
      cumulativeProbability += starType.probability;
      if (random <= cumulativeProbability) {
        const tempPosition = Math.random();
        return interpolateColor(
          starType.colorRange[0],
          starType.colorRange[1],
          tempPosition,
        );
      }
    }

    // Fallback
    return { ...stellarTypes[0].colorRange[0] };
  }

  // Create shader
  function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // Create shader program
  function createShaderProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "Shader program linking error:",
        gl.getProgramInfoLog(program),
      );
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  // Generate stars with varied sizes and opacities
  function generateStars() {
    const newStars: Star[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    const starCounts = [
      { count: 50, sizeRange: [6, 8], opacityRange: [0.95, 1] }, // Brightest stars
      { count: 150, sizeRange: [4, 6], opacityRange: [0.85, 0.95] }, // Very bright stars
      { count: 400, sizeRange: [3, 4], opacityRange: [0.7, 0.85] }, // Bright stars
      { count: 1000, sizeRange: [2, 3], opacityRange: [0.5, 0.7] }, // Medium stars
      { count: 2000, sizeRange: [1.5, 2], opacityRange: [0.35, 0.5] }, // Faint stars
      {
        count: (1 / 2) * 6000,
        sizeRange: [1, 1.5],
        opacityRange: [0.25, 0.35],
      }, // Very faint stars
      {
        count: (1 / 2) * 3000,
        sizeRange: [0.7, 1],
        opacityRange: [0.15, 0.25],
      }, // Barely visible
    ];

    for (const config of starCounts) {
      for (let i = 0; i < config.count; i++) {
        const size =
          config.sizeRange[0] +
          Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
        const baseOpacity =
          config.opacityRange[0] +
          Math.random() * (config.opacityRange[1] - config.opacityRange[0]);

        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseOpacity,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: getStarColor(),
        });
      }
    }

    return newStars;
  }

  // Create star geometry and upload to GPU
  function createStarGeometry() {
    if (!gl) return;

    const numStars = stars.length;

    // Create separate arrays for each attribute
    const positions = new Float32Array(numStars * 2);
    const sizes = new Float32Array(numStars);
    const colors = new Float32Array(numStars * 3);
    const twinkleData = new Float32Array(numStars * 3);

    for (let i = 0; i < numStars; i++) {
      const star = stars[i];

      // Position
      positions[i * 2] = star.x;
      positions[i * 2 + 1] = star.y;

      // Size
      sizes[i] = star.size;

      // Color (normalized)
      colors[i * 3] = star.color.r / 255;
      colors[i * 3 + 1] = star.color.g / 255;
      colors[i * 3 + 2] = star.color.b / 255;

      // Twinkle data
      twinkleData[i * 3] = star.baseOpacity;
      twinkleData[i * 3 + 1] = star.twinkleSpeed;
      twinkleData[i * 3 + 2] = star.twinkleOffset;
    }

    // Upload position data
    positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Upload size data
    sizeBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

    // Upload color data
    colorBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Upload twinkle data
    twinkleBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, twinkleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, twinkleData, gl.STATIC_DRAW);
  }

  function draw() {
    if (!gl || !canvas || !shaderProgram || !isVisible) return;

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use shader program
    gl.useProgram(shaderProgram);

    // Update uniforms
    gl.uniform1f(uTime, time);
    gl.uniform2f(uResolution, canvas.width, canvas.height);

    // Bind position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Bind size attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

    // Bind color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    // Bind twinkle data attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, twinkleBuffer);
    gl.enableVertexAttribArray(aTwinkleData);
    gl.vertexAttribPointer(aTwinkleData, 3, gl.FLOAT, false, 0, 0);

    // Draw all stars as points
    gl.drawArrays(gl.POINTS, 0, stars.length);

    time += 0.01;
    animationFrame = requestAnimationFrame(draw);
  }

  function handleResize() {
    if (!canvas) return;

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      if (!canvas) return;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // Skip if dimensions haven't actually changed
      if (canvas.width === newWidth && canvas.height === newHeight) {
        return;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        stars = generateStars();
        createStarGeometry();
      }
    }, 150);
  }

  function initWebGL() {
    if (!canvas) return false;

    const context = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
    });

    if (!context) {
      console.error("WebGL not supported");
      return false;
    }

    gl = context;

    // Create shader program
    const program = createShaderProgram(gl);
    if (!program) return false;

    shaderProgram = program;

    // Get attribute and uniform locations
    aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    aSize = gl.getAttribLocation(shaderProgram, "aSize");
    aColor = gl.getAttribLocation(shaderProgram, "aColor");
    aTwinkleData = gl.getAttribLocation(shaderProgram, "aTwinkleData");
    uTime = gl.getUniformLocation(shaderProgram, "uTime")!;
    uResolution = gl.getUniformLocation(shaderProgram, "uResolution")!;

    // Set clear color (transparent)
    gl.clearColor(0, 0, 0, 0);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }

  onMount(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!initWebGL()) {
      console.error("Failed to initialize WebGL");
      return;
    }

    stars = generateStars();
    createStarGeometry();
    draw();

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
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  onDestroy(() => {
    // Clean up WebGL resources
    if (gl) {
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (sizeBuffer) gl.deleteBuffer(sizeBuffer);
      if (colorBuffer) gl.deleteBuffer(colorBuffer);
      if (twinkleBuffer) gl.deleteBuffer(twinkleBuffer);
      if (shaderProgram) gl.deleteProgram(shaderProgram);
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
