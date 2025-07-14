<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { PROJECTS, SITE_CONFIG } from "$lib/constants";
</script>

<svelte:head>
  <title>Projects - {SITE_CONFIG.name}</title>
  <meta name="description" content="Projects and work by {SITE_CONFIG.name}." />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-12">
          Here are some of the projects I've worked on.
        </p>

        {#if PROJECTS.length > 0}
          <ul class="space-y-6">
            {#each PROJECTS as project}
              <li
                class="border-b border-neutral-200 dark:border-neutral-800 pb-6"
              >
                <div class="space-y-3">
                  <!-- Title with links -->
                  <div class="flex items-start justify-between gap-4">
                    {#if project.githubUrl}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group inline-flex items-center gap-1"
                      >
                        <h2
                          class="text-xl font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                        >
                          {project.title}
                        </h2>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          class="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
                          />
                          <path
                            fill-rule="evenodd"
                            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
                          />
                        </svg>
                      </a>
                    {:else}
                      <h2
                        class="text-xl font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {project.title}
                      </h2>
                    {/if}

                    {#if project.liveUrl}
                      <div class="flex-shrink-0">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          aria-label="View live demo"
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
                      </div>
                    {/if}
                  </div>

                  <!-- Description -->
                  <p class="text-neutral-600 dark:text-neutral-400">
                    {project.description}
                  </p>

                  <!-- Technologies -->
                  <div class="flex flex-wrap gap-2">
                    {#each project.technologies as tech}
                      <span
                        class="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                      >
                        {tech}
                      </span>
                    {/each}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="text-center py-24">
            <p class="text-neutral-500 dark:text-neutral-500 text-lg">
              No projects to display yet.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <Footer />
</div>
