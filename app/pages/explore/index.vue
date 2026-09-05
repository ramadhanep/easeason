<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const router = useRouter()

useHead({ title: 'Explore | easeason' })

const { data: groups } = await useFetch('/api/symbols')

const groupedSymbols = computed(() => {
  if (!groups.value) return []
  return Object.values(groups.value)
    .filter((g) => g.items.length)
    .map((g) => ({ label: g.label, items: g.items }))
})

const brandFor = (symbol: string) => BRAND_COLORS[symbol] ?? ''
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <AppHeader to="/" label="Home" />

      <div class="flex items-center gap-2 mb-3">
        <h1 class="text-3xl font-semibold tracking-tight">Explore</h1>
      </div>
      <p class="text-muted-foreground mb-12">Browse all assets by category.</p>

      <section v-for="g in groupedSymbols" :key="g.label" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ g.label }}</h2>
          <span class="text-xs text-muted-foreground">{{ g.items.length }} assets</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="s in g.items"
            :key="s.symbol"
            class="group flex flex-col justify-between rounded-2xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer min-w-0"
            :class="brandFor(s.symbol) ? '' : 'bg-muted text-foreground'"
            :style="brandFor(s.symbol) ? { backgroundColor: brandFor(s.symbol), color: brandTextColor(brandFor(s.symbol)!), } : {}"
            @click="router.push(`/explore/${s.symbol}`)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-base truncate">{{ s.symbol }}</span>
              <ArrowRight class="size-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            <span class="mt-1 text-xs opacity-70 truncate">{{ s.name }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>