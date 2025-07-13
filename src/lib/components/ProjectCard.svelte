<script lang="ts">
  import type { Project } from "$lib/types";

  export let project: Project;
</script>

<div
  class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow duration-200"
>
  <h3 class="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
    {project.title}
  </h3>

  <p class="text-neutral-600 dark:text-neutral-400 mb-4">
    {project.description}
  </p>

  <!-- Technologies -->
  <div class="flex flex-wrap gap-2 mb-4">
    {#each project.technologies as tech}
      <span
        class="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
      >
        {tech}
      </span>
    {/each}
  </div>

  <!-- Links -->
  <div class="flex gap-4">
    {#if project.githubUrl}
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on GitHub"
        class="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </a>
    {/if}

    {#if project.liveUrl}
      <a
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View live demo"
        class="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a>
    {/if}
  </div>
</div>
