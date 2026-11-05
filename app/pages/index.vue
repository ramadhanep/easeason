<script setup lang="ts">
import { FileText, ArrowRight } from '@lucide/vue'

const { data: groups } = await useFetch('/api/symbols')

const { data: articles } = await useAsyncData('home-research', () =>
  queryCollection('research')
    .select('title', 'description', 'meta', 'path')
    .all()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((docs: any[]) =>
      docs
        .map((d) => ({ ...d, symbol: d.meta?.tags?.[0] ?? d.title.split(' ')[0] }))
        .sort((a, b) => new Date(b.meta?.publishedOn).getTime() - new Date(a.meta?.publishedOn).getTime()),
    ),
)

const groupedSymbols = computed(() => Object.values(groups.value ?? {}).filter((g) => g.items.length))

const popular = ['^GSPC', '^IXIC', 'SPY', 'QQQ', 'BTC-USD', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'MU', 'SNDK', 'WMT', 'JPM', 'AMD', 'TSM', 'COIN', 'BBCA.JK', 'ETH-USD', 'SOL-USD', 'BNB-USD']

const accent = ref<string>('')
onMounted(() => {
  accent.value = Object.values(BRAND_COLORS)[Math.floor(Math.random() * Object.keys(BRAND_COLORS).length)] ?? ''
})

const nameFor = (symbol: string) => {
  for (const g of groupedSymbols.value) {
    const item = g.items.find((s) => s.symbol === symbol)
    if (item) return item.name
  }
  return symbol
}
</script>

<template>
  <div class="min-h-dvh relative bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <AppHeader :brand="accent" />

      <div class="text-left">
        <div class="flex items-start justify-start gap-3">
          <img src="/aruna.png" alt="easeason" class="size-10 rounded-full object-cover">
          <h2 class="text-3xl font-semibold tracking-tight">easeason</h2>
        </div>
        <p class="text-sm text-muted-foreground mt-2">
          Research/visualization tool for exploring how assets have historically moved throughout the year, including U.S. presidential election-cycle patterns.
        </p>
      </div>

      <div class="mt-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">Popular</h2>
          <NuxtLink to="/explore" class="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AssetTile v-for="sym in popular" :key="sym" :symbol="sym" :name="nameFor(sym)" />
        </div>
      </div>

      <section class="mt-14">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">Latest research</h2>
          <NuxtLink to="/research" class="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="a in articles"
            :key="a.path"
            :to="a.path"
            class="group border rounded-xl overflow-hidden hover:bg-muted/40 transition-colors"
          >
            <div class="aspect-[16/8] border-b">
              <ArticleThumbnail :symbol="a.symbol" />
            </div>
            <div class="p-4">
              <h3 class="font-medium leading-snug group-hover:text-foreground/80">{{ a.title }}</h3>
              <p v-if="a.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ a.description }}</p>
              <p v-if="a.meta?.publishedOn" class="mt-2 text-xs text-muted-foreground/70">{{ new Date(a.meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <footer class="mt-14 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        <NuxtLink to="/research" class="inline-flex items-center gap-1 hover:text-foreground">
          <FileText class="size-3.5" /> Research
        </NuxtLink>
        <span class="mx-2">·</span>
        Historical statistics, not financial advice.
      </footer>
    </div>
  </div>
</template>
