<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { SKILLS, SITE_CONFIG } from "$lib/constants";

  const skillsByCategory = SKILLS.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof SKILLS>,
  );

  const categoryLabels: Record<string, string> = {
    language: "Languages",
    framework: "Frameworks & Technologies",
    other: "Other Skills",
  };
</script>

<svelte:head>
  <title>Skills - {SITE_CONFIG.name}</title>
  <meta
    name="description"
    content="Technical skills and expertise of {SITE_CONFIG.name}."
  />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h1
          class="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100"
        >
          Skills & Technologies
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-12">
          An overview of the technologies and tools I've worked with.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each Object.entries(skillsByCategory) as [category, skills]}
            <div>
              <h2
                class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200"
              >
                {categoryLabels[category] || category}
              </h2>
              <div class="flex flex-wrap gap-2">
                {#each skills as skill}
                  <span
                    class="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                  >
                    {skill.name}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </main>

  <Footer />
</div>
