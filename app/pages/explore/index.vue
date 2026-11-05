<script setup lang="ts">
useHead({ title: 'Explore | easeason' })

const { data: groups } = await useFetch('/api/symbols')

const groupedSymbols = computed(() =>
  Object.values(groups.value ?? {}).filter((g) => g.items.length),
)

const total = computed(() => groupedSymbols.value.reduce((n, g) => n + g.items.length, 0))
const category = ref('all')
const visible = computed(() =>
  category.value === 'all' ? groupedSymbols.value : groupedSymbols.value.filter((g) => g.label === category.value),
)
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader />

    <main class="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Explore</h1>
      <p class="mt-2 text-muted-foreground">Browse {{ total }} assets by category.</p>

      <div class="sticky top-14 z-30 -mx-4 mt-6 overflow-x-auto bg-background/85 px-4 py-3 backdrop-blur-xl [scrollbar-width:none]">
        <div class="flex w-max items-center gap-2">
          <button
            v-for="c in [{ label: 'all', title: 'All' }, ...groupedSymbols.map((g) => ({ label: g.label, title: g.label }))]"
            :key="c.label"
            class="cursor-pointer whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors"
            :class="category === c.label ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'"
            :aria-pressed="category === c.label"
            @click="category = c.label"
          >
            {{ c.title }}
          </button>
        </div>
      </div>

      <section v-for="g in visible" :key="g.label" class="mt-8">
        <div class="mb-4 flex items-baseline gap-3">
          <h2 class="text-lg font-semibold tracking-tight">{{ g.label }}</h2>
          <span class="font-mono text-xs text-muted-foreground">{{ g.items.length }}</span>
        </div>
        <div class="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AssetTile v-for="s in g.items" :key="s.symbol" :symbol="s.symbol" :name="s.name" />
        </div>
      </section>
    </main>
  </div>
</template>
