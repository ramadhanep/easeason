<script setup lang="ts">
import { ArrowLeft, Download, CloudOff, FileText } from '@lucide/vue'
import { profileDescription } from '#shared/seasonal'
const route = useRoute()
const symbol = computed(() => route.params.symbol as string)

const { data, pending, error } = await useFetch('/api/seasonal', {
  query: { symbol },
  watch: [symbol],
})

const yKey = ref<'pct' | 'factor'>('pct')
const view = ref<'chart' | 'stats' | 'animate'>('chart')
const chartRef = ref<{ exportPng: () => void; setZoom: (end: number) => void; resetZoom: () => void } | null>(null)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const animating = ref(false)
let animTimer: ReturnType<typeof setInterval> | null = null

function startAnimation() {
  view.value = 'animate'
  animating.value = true
  chartRef.value?.resetZoom()
  let day = 1
  animTimer = setInterval(() => {
    if (day >= 100) {
      if (animTimer) clearInterval(animTimer)
      animTimer = null
      animating.value = false
      return
    }
    chartRef.value?.setZoom(day)
    day++
  }, 35)
}

function stopAnimation() {
  if (animTimer) clearInterval(animTimer)
  animTimer = null
  animating.value = false
  chartRef.value?.resetZoom()
}

onBeforeUnmount(() => {
  if (animTimer) clearInterval(animTimer)
})

useHead({
  title: computed(() => {
    if (data.value?.meta.name && symbol.value) {
      return `${symbol.value} Seasonality | easeason`
    }
    return 'easeason'
  }),
})

const fmt = (n: number | undefined): string => {
  if (n == null || !Number.isFinite(n)) return '—'
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
}

const totalProfiles = computed(() => data.value?.profiles?.length ?? 0)

interface StatRow {
  label: string
  avg: number
  median: number
  std: number
  winRate: number
  best: number
  worst: number
  end: number
}

const stats = computed<StatRow[]>(() => {
  const rows = data.value?.profiles ?? []
  return rows.map((p) => {
    const vals = p.points.map((pt) => pt.pct)
    const n = vals.length
    if (n === 0) return { label: p.label, avg: 0, median: 0, std: 0, winRate: 0, best: 0, worst: 0, end: 0 }
    const avg = vals.reduce((a, b) => a + b, 0) / n
    const sorted = [...vals].sort((a, b) => a - b)
    const mid = Math.floor(n / 2)
    const median = n % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / n)
    const winRate = (vals.filter((v) => v > 0).length / n) * 100
    return { label: p.label, avg, median, std, winRate, best: Math.max(...vals), worst: Math.min(...vals), end: vals[n - 1]! }
  })
})

const { data: relatedArticles } = await useAsyncData(`related-${symbol.value}`, () =>
  queryCollection('research')
    .select('title', 'description', 'meta', 'path')
    .all()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((docs: any[]) =>
      docs
        .map((d) => ({ ...d, symbol: d.meta?.tags?.[0] ?? d.title.split(' ')[0] }))
        .filter((a) => a.meta?.tags?.some((t: string) => t.toUpperCase() === symbol.value.toUpperCase()))
        .sort((a, b) => new Date(b.meta?.publishedOn).getTime() - new Date(a.meta?.publishedOn).getTime()),
    ),
)

const bg = computed(() => BRAND_COLORS[symbol.value])
const fg = computed(() => {
  const color = bg.value
  return color ? brandTextColor(color) : undefined
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <AppHeader to="/" label="Home" :brand="bg" />

      <div v-if="pending" class="space-y-4">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-[540px] w-full" />
      </div>

      <div v-else-if="error" class="py-24 text-center">
        <div class="inline-flex items-center justify-center size-12 rounded-full border bg-muted/40 mb-4">
          <CloudOff class="size-5 text-muted-foreground" />
        </div>
        <h2 class="text-lg font-medium mb-2">Unable to load market data</h2>
        <p class="text-sm text-muted-foreground">
          Yahoo Finance may be temporarily unavailable. Please try again later.
        </p>
        <Button variant="outline" size="sm" class="mt-6 gap-1.5" @click="navigateTo('/')">
          <ArrowLeft class="size-4" /> Back home
        </Button>
      </div>

      <div v-else-if="data">
        <div class="mb-6">
          <div class="flex items-end gap-2">
            <h1 class="text-3xl font-bold tracking-tight">{{ symbol }}</h1>
            <span class="text-base font-medium text-muted-foreground mb-1">{{ data.meta.name }}</span>
          </div>
          <div class="mt-2 flex items-end gap-4 flex-wrap">
            <div v-if="data.meta.currentPrice" class="flex items-baseline gap-2">
              <span class="text-2xl font-semibold">{{ fmt(data.meta.currentPrice) }}</span>
              <span class="text-sm text-muted-foreground">Current</span>
            </div>
            <div v-if="data.meta.firstYear" class="text-sm text-muted-foreground">
              {{ data.meta.firstYear }} – {{ data.meta.lastYear }}
            </div>
            <div class="text-sm text-muted-foreground">{{ totalProfiles }} profiles</div>
          </div>
        </div>

        <div class="rounded-[2rem] bg-background/40 backdrop-blur-xl">
          <div class="mb-3 flex items-center justify-between gap-3 flex-wrap px-1">
            <div class="inline-flex items-center gap-1 rounded-full bg-muted p-1">
              <button
                :class="view !== 'chart' ? 'text-muted-foreground' : ''"
                :style="view === 'chart' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
                :aria-pressed="view === 'chart'"
                @click="view = 'chart'; stopAnimation(); chartRef?.resetZoom()"
              >
                Chart
              </button>
              <button
                :class="view !== 'stats' ? 'text-muted-foreground' : ''"
                :style="view === 'stats' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
                :aria-pressed="view === 'stats'"
                @click="view = 'stats'; stopAnimation()"
              >
                Statistics
              </button>
              <button
                :class="view !== 'animate' ? 'text-muted-foreground' : ''"
                :style="view === 'animate' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
                :aria-pressed="view === 'animate'"
                @click="animating ? stopAnimation() : startAnimation()"
              >
                Animate
              </button>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" class="gap-1.5 cursor-pointer rounded-full" @click="chartRef?.exportPng()">
                <Download class="size-4" /> .PNG
              </Button>
              <NuxtLink :to="`/explore/${symbol}/context`" class="inline-flex items-center gap-1.5 rounded-full border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <FileText class="size-4" /> Context
              </NuxtLink>
            </div>
          </div>

          <div v-if="view === 'chart'" class="mb-3 flex items-center justify-center">
            <div class="inline-flex items-center gap-1 rounded-full bg-muted p-1">
              <button
                :class="yKey === 'pct' ? 'shadow-sm' : 'text-muted-foreground'"
                :style="yKey === 'pct' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1 text-xs font-medium transition-colors cursor-pointer"
                :aria-pressed="yKey === 'pct'"
                @click="yKey = 'pct'"
              >
                Percentage
              </button>
              <button
                :class="yKey === 'factor' ? 'shadow-sm' : 'text-muted-foreground'"
                :style="yKey === 'factor' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1 text-xs font-medium transition-colors cursor-pointer"
                :aria-pressed="yKey === 'factor'"
                @click="yKey = 'factor'"
              >
                Growth Factor
              </button>
            </div>
          </div>

          <ClientOnly>
            <SeasonalChart
              v-show="view === 'chart' || view === 'animate'"
              ref="chartRef"
              :profiles="data.profiles"
              :current-year="data.currentYear"
              :y-key="yKey"
              :is-dark="isDark"
              :symbol="symbol"
              class="h-[540px]"
            />
            <template #fallback>
              <Skeleton class="h-[540px] w-full" />
            </template>
          </ClientOnly>

          <div v-if="view === 'stats'" class="overflow-hidden rounded-2xl border border-border/40">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-muted-foreground border-b">
                    <th class="px-4 py-2.5 text-left font-medium">Profile</th>
                    <th class="px-4 py-2.5 text-right font-medium">Avg %</th>
                    <th class="px-4 py-2.5 text-right font-medium">Median %</th>
                    <th class="px-4 py-2.5 text-right font-medium">Std Dev</th>
                    <th class="px-4 py-2.5 text-right font-medium">Win Rate</th>
                    <th class="px-4 py-2.5 text-right font-medium">Best</th>
                    <th class="px-4 py-2.5 text-right font-medium">Worst</th>
                    <th class="px-4 py-2.5 text-right font-medium">Year-end</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in stats" :key="s.label" class="border-b last:border-0">
                    <td class="px-4 py-2.5 font-medium">{{ s.label }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ fmt(s.avg) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ fmt(s.median) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ fmt(s.std) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ s.winRate.toFixed(0) }}%</td>
                    <td class="px-4 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">+{{ fmt(s.best) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono text-red-600 dark:text-red-400">{{ fmt(s.worst) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ fmt(s.end) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p class="mt-3 text-xs text-muted-foreground text-right">
          Toggle profiles from the legend · hover to inspect
        </p>

        <div class="mt-10">
          <div v-if="data.profiles.length || data.currentYear" class="rounded-2xl border border-border/40 divide-y bg-background/40 backdrop-blur-xl overflow-hidden">
            <div
              v-for="p in [...data.profiles, ...(data.currentYear ? [{ id: 'current-year', label: `${data.currentYear.year} YTD`, years: [data.currentYear.year] }] : [])]"
              :key="p.label"
              class="px-4 py-3 flex items-start justify-between gap-4"
            >
              <div>
                <p class="font-medium text-sm">{{ p.label }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ profileDescription(p.id) }}</p>
                <p v-if="p.years.length && p.id !== 'all-years'" class="text-xs text-muted-foreground/80 mt-1 font-mono">
                  {{ p.years.join(', ') }}
                </p>
              </div>
              <span v-if="p.years.length" class="text-xs text-muted-foreground whitespace-nowrap shrink-0 font-mono">
                {{ Math.min(...p.years) }}–{{ Math.max(...p.years) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="relatedArticles && relatedArticles.length" class="mt-10">
          <h2 class="text-lg font-medium mb-4">Related research</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <NuxtLink
              v-for="a in relatedArticles"
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
                <p v-if="a.meta?.publishedOn" class="mt-2 text-xs text-muted-foreground/70">
                  {{ new Date(a.meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <footer class="mt-10 text-center text-xs text-muted-foreground">
          Historical statistics based on available market data. Not financial advice.
        </footer>
      </div>
    </div>
  </div>
</template>
