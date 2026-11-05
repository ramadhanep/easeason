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

const activeStats = computed(() => {
  const p = data.value?.profiles.find((x) => x.id === seasonTab.value)
  return p ? computeStats(p.label, p.points) : undefined
})
const signed = (n: number) => `${n >= 0 ? '+' : ''}${fmt(n)}%`

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
    <AppHeader :to="backTo" :label="backLabel" :brand="bg" :symbol="symbol" />

    <main class="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <div v-if="pending" class="space-y-4">
        <div class="flex items-center gap-4">
          <Skeleton class="size-14 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-7 w-40" />
            <Skeleton class="h-4 w-56" />
          </div>
        </div>
        <Skeleton class="h-[420px] w-full rounded-2xl sm:h-[560px]" />
      </div>

      <div v-else-if="error" class="py-24 text-center">
        <div class="mb-4 inline-flex size-12 items-center justify-center rounded-full border bg-muted/40">
          <CloudOff class="size-5 text-muted-foreground" />
        </div>
        <h2 class="mb-2 text-lg font-medium">Unable to load market data</h2>
        <p class="text-sm text-muted-foreground">Yahoo Finance may be temporarily unavailable. Please try again later.</p>
        <Button variant="outline" size="sm" class="mt-6 gap-1.5" @click="navigateTo('/')">
          <ArrowLeft class="size-4" /> Back home
        </Button>
      </div>

      <div v-else-if="data">
        <!-- Title block -->
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div class="flex items-center gap-4">
            <SymbolLogo :symbol="symbol" class="size-14" />
            <div class="min-w-0">
              <h1 class="text-3xl font-semibold tracking-tight">{{ symbol }}</h1>
              <p class="truncate text-sm text-muted-foreground">{{ data.meta.name }}</p>
            </div>
          </div>
          <div class="flex items-end gap-6">
            <div v-if="data.meta.currentPrice" class="text-right">
              <p class="text-xs text-muted-foreground">Last close</p>
              <p class="font-mono text-2xl font-semibold tabular-nums">{{ fmt(data.meta.currentPrice) }}</p>
            </div>
            <div v-if="data.meta.firstYear" class="hidden text-right sm:block">
              <p class="text-xs text-muted-foreground">History</p>
              <p class="font-mono text-2xl font-semibold tabular-nums">{{ data.meta.lastYear! - data.meta.firstYear + 1 }}<span class="ml-1 text-sm font-normal text-muted-foreground">yrs</span></p>
            </div>
          </div>
        </div>

        <!-- Chart card -->
        <section class="surface p-3 sm:p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl
              :model-value="view"
              :options="VIEW_TABS"
              :brand="bg"
              :fg="fg"
              @update:model-value="onView($event as typeof view)"
            />
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9"
                aria-label="Download chart as PNG"
                @click="chartRef?.exportPng()"
              >
                <Download class="size-4" /> <span class="hidden sm:inline">PNG</span>
              </button>
              <NuxtLink
                :to="`/explore/${symbol}/context`"
                aria-label="Open context"
                class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9"
              >
                <FileText class="size-4" /> <span class="hidden sm:inline">Context</span>
              </NuxtLink>
            </div>
          </div>

          <div v-if="view === 'chart'" class="mb-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)]">
            <SegmentedControl v-model="seasonTab" :options="seasonTabs" :brand="bg" :fg="fg" />
            <button
              v-if="data.profiles.some(p => p.id === 'trump-years')"
              :class="!trumpEnabled ? 'border-border text-muted-foreground hover:text-foreground' : 'border-transparent shadow-sm'"
              :style="trumpEnabled ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
              class="shrink-0 cursor-pointer whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors sm:py-2"
              :aria-pressed="trumpEnabled"
              @click="trumpEnabled = !trumpEnabled"
            >
              Trump Presidency Years
            </button>
          </div>

          <p v-if="view === 'chart'" class="mb-3 text-xs text-muted-foreground">
            {{ profileDescription(seasonTab) }}
          </p>

          <div v-if="view === 'animate'" class="mb-3 flex items-center gap-2">
            <SegmentedControl v-model="animSpeed" :options="SPEED_OPTIONS" :brand="bg" :fg="fg" />
            <button
              class="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 sm:size-9"
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
              class="h-[400px] sm:h-[500px] lg:h-[560px]"
              @view-detail="seasonTab = $event"
            />
            <template #fallback>
              <Skeleton class="h-[400px] w-full sm:h-[500px] lg:h-[560px]" />
            </template>
          </ClientOnly>

          <div v-if="view === 'stats'" class="overflow-hidden rounded-xl border border-border">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-muted/50 text-xs text-muted-foreground">
                    <th class="sticky left-0 bg-muted px-4 py-2.5 text-left font-medium">Profile</th>
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
                  <tr v-for="s in stats" :key="s.label" class="border-b last:border-0 hover:bg-muted/30">
                    <td class="sticky left-0 bg-card px-4 py-2.5 font-medium">{{ s.label }}</td>
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

          <p class="mt-3 text-right text-xs text-muted-foreground">Toggle profiles from the legend · hover to inspect</p>
        </section>

        <!-- Key stats for the selected profile -->
        <section v-if="activeStats" class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Key stats">
          <div class="surface p-4">
            <p class="text-xs text-muted-foreground">Avg end of period</p>
            <p class="mt-1 font-mono text-xl font-semibold tabular-nums" :class="activeStats.end >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ signed(activeStats.end) }}</p>
          </div>
          <div class="surface p-4">
            <p class="text-xs text-muted-foreground">Seasonal peak</p>
            <p class="mt-1 font-mono text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{{ signed(activeStats.best) }}</p>
          </div>
          <div class="surface p-4">
            <p class="text-xs text-muted-foreground">Seasonal trough</p>
            <p class="mt-1 font-mono text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">{{ signed(activeStats.worst) }}</p>
          </div>
          <div class="surface p-4">
            <p class="text-xs text-muted-foreground">Days positive</p>
            <p class="mt-1 font-mono text-xl font-semibold tabular-nums">{{ activeStats.winRate.toFixed(0) }}%</p>
          </div>
        </section>

        <!-- Profiles -->
        <section class="mt-12">
          <h2 class="mb-4 text-lg font-semibold tracking-tight">Profiles <span class="ml-1 font-mono text-xs font-normal text-muted-foreground">{{ totalProfiles }}</span></h2>
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="p in [...data.profiles, ...(data.currentYear ? [{ id: 'current-year', label: `${data.currentYear.year} YTD`, years: [data.currentYear.year] }] : [])]"
              :key="p.label"
              class="surface flex items-start justify-between gap-4 p-4"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ p.label }}</p>
                <p class="mt-0.5 text-xs text-muted-foreground">{{ profileDescription(p.id) }}</p>
                <p v-if="p.years.length && p.id !== 'all-years'" class="mt-1.5 font-mono text-xs text-muted-foreground/80">{{ p.years.join(', ') }}</p>
              </div>
              <span v-if="p.years.length" class="shrink-0 whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                {{ Math.min(...p.years) }}–{{ Math.max(...p.years) }}
              </span>
            </div>
          </div>
        </section>

        <section v-if="relatedArticles && relatedArticles.length" class="mt-12">
          <h2 class="mb-4 text-lg font-semibold tracking-tight">Related research</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ArticleCard v-for="a in relatedArticles" :key="a.path" :article="a" />
          </div>
        </section>

        <footer class="mt-12 text-center text-xs text-muted-foreground">
          Historical statistics based on available market data. Not financial advice.
        </footer>
      </div>
    </main>
  </div>
</template>
