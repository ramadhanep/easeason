<script setup lang="ts">
import { ArrowLeft, Moon, Sun, Download, CloudOff, FileText } from '@lucide/vue'
import { profileDescription } from '#shared/seasonal'
const route = useRoute()
const symbol = computed(() => route.params.symbol as string)

const { data, pending, error } = await useFetch('/api/seasonal', {
  query: { symbol },
  watch: [symbol],
})

const yKey = ref<'pct' | 'factor'>('pct')
const chartRef = ref<{ exportPng: () => void } | null>(null)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => { mounted.value = true })

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

const bg = computed(() => BRAND_COLORS[symbol.value])
const fg = computed(() => {
  const color = bg.value
  return color ? brandTextColor(color) : undefined
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <header class="mb-8 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft class="size-4" /> Home
        </NuxtLink>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          @click="colorMode.preference = isDark ? 'light' : 'dark'"
        >
          <Sun v-if="mounted && isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
      </header>

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
                :class="yKey === 'pct' ? 'shadow-sm' : 'text-muted-foreground'"
                :style="yKey === 'pct' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
                @click="yKey = 'pct'"
              >
                Percentage
              </button>
              <button
                :class="yKey === 'factor' ? 'shadow-sm' : 'text-muted-foreground'"
                :style="yKey === 'factor' ? { backgroundColor: bg ?? 'var(--background)', color: fg } : {}"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
                @click="yKey = 'factor'"
              >
                Growth Factor
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

          <ClientOnly>
            <SeasonalChart ref="chartRef" :profiles="data.profiles" :current-year="data.currentYear" :y-key="yKey" :is-dark="isDark" :symbol="symbol" />
            <template #fallback>
              <Skeleton class="h-[540px] w-full" />
            </template>
          </ClientOnly>
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

        <footer class="mt-10 text-center text-xs text-muted-foreground">
          Historical statistics based on available market data. Not financial advice.
        </footer>
      </div>
    </div>
  </div>
</template>
