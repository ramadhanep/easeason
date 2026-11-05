<script setup lang="ts">
import { ArrowLeft, Download, CloudOff, FileText, Play, Pause } from '@lucide/vue'
import { computeStats, profileDescription, type ProfileStats } from '#shared/seasonal'
const route = useRoute()
const symbol = computed(() => route.params.symbol as string)

const { data, pending, error } = await useFetch('/api/seasonal', {
  query: { symbol },
  watch: [symbol],
})

const seasonTab = ref(data.value?.profiles.some((p) => p.id === 'full-seasons') ? 'full-seasons' : 'all-years')
const horizonDays = computed(() => seasonTab.value === 'full-seasons' ? 1461 : 365)
const view = ref<'chart' | 'stats' | 'animate'>('chart')
const VIEW_TABS = [{ id: 'chart', label: 'Chart' }, { id: 'stats', label: 'Statistics' }, { id: 'animate', label: 'Animate' }]
const chartRef = ref<{ exportPng: () => void; setZoom: (end: number) => void; resetZoom: () => void } | null>(null)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const animating = ref(false)
const activeDay = ref<number | null>(null)
let animTimer: ReturnType<typeof setInterval> | null = null

const SPEED_OPTIONS = [0.5, 1, 2, 4].map((n) => ({ id: n, label: `${n}x` }))
const animSpeed = ref(1)

function runFrom(startDay: number) {
  animating.value = true
  activeDay.value = startDay
  chartRef.value?.setZoom((startDay / horizonDays.value) * 100)
  let day = startDay
  animTimer = setInterval(() => {
    if (day >= horizonDays.value) {
      if (animTimer) clearInterval(animTimer)
      animTimer = null
      activeDay.value = horizonDays.value
      animating.value = false
      return
    }
    day = Math.min(horizonDays.value, day + Math.round(2 * animSpeed.value))
    activeDay.value = day
    chartRef.value?.setZoom((day / horizonDays.value) * 100)
  }, 45)
}

function startAnimation() {
  view.value = 'animate'
  runFrom(1)
}

function playAnimation() {
  view.value = 'animate'
  const start = activeDay.value == null || activeDay.value >= horizonDays.value ? 1 : activeDay.value
  runFrom(start)
}

function onView(v: typeof view.value) {
  if (v === 'animate') return animating.value ? stopAnimation() : startAnimation()
  stopAnimation()
  view.value = v
  if (v === 'chart') {
    activeDay.value = null
    chartRef.value?.resetZoom()
  }
}

function stopAnimation() {
  if (animTimer) clearInterval(animTimer)
  animTimer = null
  animating.value = false
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

const SEASON_TABS: Array<{ id: string; label: string }> = [
  { id: 'full-seasons', label: 'Full Seasons' },
  { id: 'all-years', label: 'All Seasons' },
  { id: 'pre-election', label: 'Pre-Election' },
  { id: 'election', label: 'Election' },
  { id: 'post-election', label: 'Post-Election' },
  { id: 'mid-term', label: 'Mid-Term' },
]

const seasonTabs = computed(() => {
  const ids = new Set((data.value?.profiles ?? []).map((p) => p.id))
  return SEASON_TABS.filter((t) => ids.has(t.id))
})

const trumpEnabled = ref(false)

const stats = computed<ProfileStats[]>(() =>
  (data.value?.profiles ?? []).map((p) => computeStats(p.label, p.points)),
)

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

const backTo = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (route.meta as any).from as string | undefined
  return from?.startsWith('/explore') ? '/explore' : '/'
})
const backLabel = computed(() => (backTo.value === '/explore' ? 'Explore' : 'Home'))
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <AppHeader :to="backTo" :label="backLabel" :brand="bg" :symbol="symbol" />

      <div v-if="pending" class="space-y-4">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-[360px] sm:h-[480px] lg:h-[540px] w-full" />
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
            <SegmentedControl
              :model-value="view"
              :options="VIEW_TABS"
              :brand="bg"
              :fg="fg"
              @update:model-value="onView($event as typeof view)"
            />
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" class="h-10 gap-1.5 cursor-pointer rounded-full sm:h-9" aria-label="Download chart as PNG" @click="chartRef?.exportPng()">
                <Download class="size-4" /> <span class="hidden sm:inline">.PNG</span>
              </Button>
              <NuxtLink :to="`/explore/${symbol}/context`" aria-label="Open context" class="inline-flex h-10 items-center gap-1.5 rounded-full border border-input bg-transparent px-3 text-sm sm:h-9 shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <FileText class="size-4" /> <span class="hidden sm:inline">Context</span>
              </NuxtLink>
            </div>
          </div>

          <div v-if="view === 'chart'" class="mb-3 flex items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)]">
            <SegmentedControl v-model="seasonTab" :options="seasonTabs" :brand="bg" :fg="fg" />
            <button
              v-if="data.profiles.some(p => p.id === 'trump-years')"
              :class="!trumpEnabled ? 'bg-muted text-muted-foreground hover:text-foreground' : ''"
              :style="trumpEnabled ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
              class="shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2"
              :aria-pressed="trumpEnabled"
              @click="trumpEnabled = !trumpEnabled"
            >
              Trump Presidency Years
            </button>
          </div>

          <p v-if="view === 'chart'" class="mb-3 px-1 text-xs text-muted-foreground">
            {{ profileDescription(seasonTab) }}
          </p>

          <div v-if="view === 'animate'" class="mb-3 flex items-center gap-2 px-1">
            <SegmentedControl v-model="animSpeed" :options="SPEED_OPTIONS" :brand="bg" :fg="fg" />
            <button
              class="inline-flex items-center justify-center size-10 sm:size-9 rounded-full bg-muted transition-colors cursor-pointer shrink-0"
              :aria-label="animating ? 'Pause' : 'Play'"
              @click="animating ? stopAnimation() : playAnimation()"
            >
              <Pause v-if="animating" class="size-3.5" />
              <Play v-else class="size-3.5" />
            </button>
          </div>

          <ClientOnly>
            <SeasonalChart
              v-show="view === 'chart' || view === 'animate'"
              ref="chartRef"
              :profiles="data.profiles"
              :current-year="data.currentYear"
              :latest-seasons="data.latestSeasons"
              :start-phase="data.fullSeasonStart"
              :season-filter="seasonTab"
              :trump-enabled="trumpEnabled"
              :brand="bg"
              :is-dark="isDark"
              :symbol="symbol"
              :active-day="activeDay"
              class="h-[360px] sm:h-[480px] lg:h-[540px]"
              @view-detail="seasonTab = $event"
            />
            <template #fallback>
              <Skeleton class="h-[360px] sm:h-[480px] lg:h-[540px] w-full" />
            </template>
          </ClientOnly>

          <div v-if="view === 'stats'" class="overflow-hidden rounded-2xl border border-border/40">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-muted-foreground border-b">
                    <th class="sticky left-0 bg-background px-4 py-2.5 text-left font-medium">Profile</th>
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
                    <td class="sticky left-0 bg-background px-4 py-2.5 font-medium">{{ s.label }}</td>
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
