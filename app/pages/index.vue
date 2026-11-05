<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

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

const totalAssets = computed(() => groupedSymbols.value.reduce((n, g) => n + g.items.length, 0))

const nameFor = (symbol: string) => {
  for (const g of groupedSymbols.value) {
    const item = g.items.find((s) => s.symbol === symbol)
    if (item) return item.name
  }
  return symbol
}
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader />

    <main>
      <section class="relative overflow-hidden border-b border-border/70">
        <div class="bg-dots pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
          <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span class="size-1.5 rounded-full bg-emerald-500" /> Open-source seasonality research
          </p>
          <h1 class="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            See how markets move<br class="hidden sm:block"> through the year.
          </h1>
          <p class="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Explore historical seasonality for stocks, crypto and indices, including U.S. presidential election-cycle patterns.
          </p>
          <div class="mx-auto mt-8 max-w-xl">
            <SymbolSearch variant="hero" />
          </div>
          <p class="mt-4 text-xs text-muted-foreground">
            {{ totalAssets }} assets · 4-year election cycles · Updated daily
          </p>
        </div>
      </section>

      <div class="mx-auto max-w-6xl space-y-16 px-4 py-14">
        <section>
          <div class="mb-5 flex items-end justify-between">
            <div>
              <h2 class="text-xl font-semibold tracking-tight">Popular</h2>
              <p class="mt-1 text-sm text-muted-foreground">Most explored assets.</p>
            </div>
            <NuxtLink to="/explore" class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
              View all <ArrowRight class="size-4" />
            </NuxtLink>
          </div>
          <div class="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AssetTile v-for="sym in popular" :key="sym" :symbol="sym" :name="nameFor(sym)" />
          </div>
        </section>

        <section v-if="articles?.length">
          <div class="mb-5 flex items-end justify-between">
            <div>
              <h2 class="text-xl font-semibold tracking-tight">Latest research</h2>
              <p class="mt-1 text-sm text-muted-foreground">Independent notes on market seasonality.</p>
            </div>
            <NuxtLink to="/research" class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
              View all <ArrowRight class="size-4" />
            </NuxtLink>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ArticleCard v-for="a in articles.slice(0, 6)" :key="a.path" :article="a" />
          </div>
        </section>
      </div>
    </main>

    <footer class="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
      Historical statistics, not financial advice.
    </footer>
  </div>
</template>
