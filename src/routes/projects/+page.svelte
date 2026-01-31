<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/constants";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const canonicalUrl = `${SITE_URL}/projects`;
  const description = "Projects and open source work by Anand Shankar Dyavanapalli.";
</script>

<Seo title="Projects" {description} {canonicalUrl} />

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-ctp-subtext1 mb-12">
          Here are some of the projects I've worked on.
        </p>

        {#if data.projects.length > 0}
          <ul class="space-y-6">
            {#each data.projects as project}
              <li
                class="border-b border-ctp-surface0 pb-6"
              >
                <div class="space-y-3">
                  <!-- Title with links -->
                  <div class="inline-flex items-center gap-3">
                    {#if project.liveUrl}
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group inline-flex items-center gap-2"
                      >
                        <h2
                          class="text-xl font-medium text-ctp-text group-hover:text-ctp-mauve transition-colors"
                        >
                          {project.title}
                        </h2>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-4 h-4 text-ctp-overlay0 group-hover:text-ctp-mauve transition-colors"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                      {#if project.githubUrl}
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub repository for {project.title}"
                          class="text-ctp-overlay0 hover:text-ctp-mauve transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-5 h-5"
                          >
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        </a>
                      {/if}
                    {:else if project.githubUrl}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group inline-flex items-center gap-2"
                      >
                        <h2
                          class="text-xl font-medium text-ctp-text group-hover:text-ctp-mauve transition-colors"
                        >
                          {project.title}
                        </h2>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-5 h-5 text-ctp-overlay0 group-hover:text-ctp-mauve transition-colors"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </a>
                    {:else}
                      <h2 class="text-xl font-medium text-ctp-text">
                        {project.title}
                      </h2>
                    {/if}
                  </div>

                  <!-- Description -->
                  <p class="text-ctp-subtext1">
                    {project.description}
                  </p>

                  <!-- Blog post link -->
                  {#if project.blogPostSlug}
                    <a
                      href="/blog/{project.blogPostSlug}"
                      class="inline-flex items-center gap-1.5 text-sm text-ctp-mauve hover:text-ctp-pink transition-colors font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                      Read more about {project.title}
                    </a>
                  {/if}

                  <!-- Technologies -->
                  <div class="flex flex-wrap gap-2">
                    {#each project.technologies as tech}
                      <span
                        class="px-3 py-1 rounded-lg bg-ctp-surface0 border border-ctp-surface1 text-xs font-medium text-ctp-text shadow-sm"
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
            <p class="text-ctp-subtext1 text-lg">
              No projects to display yet.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <Footer />
</div>
