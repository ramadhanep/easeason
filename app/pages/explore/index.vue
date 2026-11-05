<script setup lang="ts">
useHead({ title: 'Explore | easeason' })

const { data: groups } = await useFetch('/api/symbols')

const groupedSymbols = computed(() =>
  Object.values(groups.value ?? {}).filter((g) => g.items.length),
)

const category = ref('all')
const visible = computed(() =>
  category.value === 'all' ? groupedSymbols.value : groupedSymbols.value.filter((g) => g.label === category.value),
)
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <AppHeader to="/" label="Home" />

      <h1 class="text-3xl font-semibold tracking-tight mb-3">Explore</h1>
      <p class="text-muted-foreground mb-6">Browse all assets by category.</p>

      <div class="sticky top-[4.75rem] z-30 -mx-4 mb-6 overflow-x-auto bg-background/80 px-4 py-2 backdrop-blur-xl">
        <div class="flex w-max items-center gap-2">
          <button
            v-for="c in [{ label: 'all', title: 'All' }, ...groupedSymbols.map((g) => ({ label: g.label, title: g.label }))]"
            :key="c.label"
            class="cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
            :class="category === c.label ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground'"
            :aria-pressed="category === c.label"
            @click="category = c.label"
          >
            {{ c.title }}
          </button>
        </div>
      </div>

      <section v-for="g in visible" :key="g.label" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ g.label }}</h2>
          <span class="text-xs text-muted-foreground">{{ g.items.length }} assets</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AssetTile v-for="s in g.items" :key="s.symbol" :symbol="s.symbol" :name="s.name" />
        </div>
      </section>
    </div>
  </div>
</template>
