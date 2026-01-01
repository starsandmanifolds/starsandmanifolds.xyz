<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/constants";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { projects } = data;

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

        {#if projects.length > 0}
          <ul class="space-y-6">
            {#each projects as project}
              <li
                class="border-b border-ctp-surface0 pb-6"
              >
                <div class="space-y-3">
                  <!-- Title with link to external URL -->
                  {#if project.githubUrl || project.liveUrl}
                    <a
                      href={project.githubUrl || project.liveUrl}
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
                  {:else}
                    <h2
                      class="text-xl font-medium text-ctp-text"
                    >
                      {project.title}
                    </h2>
                  {/if}

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
