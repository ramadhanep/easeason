<script setup lang="ts">
import { ArrowLeft, Moon, Sun, Download, CalendarRange, BarChart3, LineChart, CloudOff, FileDown, Table } from '@lucide/vue'
import { buildSeasonalMarkdown, profileDescription, type SeasonalData } from '#shared/seasonal'
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

function exportMarkdown() {
  if (!data.value) return
  const md = buildSeasonalMarkdown(data.value as SeasonalData)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `easeason-${data.value.meta.symbol}-seasonality.md`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
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
        <Skeleton class="h-[480px] w-full" />
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
        <div class="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
              {{ symbol }}
              <span class="text-sm font-normal text-muted-foreground">{{ data.meta.name }}</span>
            </h1>
            <div class="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <span v-if="data.meta.currentPrice" class="flex items-center gap-1.5">
                <BarChart3 class="size-4" /> {{ fmt(data.meta.currentPrice) }}
              </span>
              <span v-if="data.meta.firstYear" class="flex items-center gap-1.5">
                <CalendarRange class="size-4" />
                {{ data.meta.firstYear }} – {{ data.meta.lastYear }}
              </span>
              <span class="flex items-center gap-1.5">
                <LineChart class="size-4" /> {{ totalProfiles }} profiles
              </span>
            </div>
          </div>
        </div>

        <div class="mb-3 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <Label class="text-sm text-muted-foreground">Scale</Label>
            <Select v-model="yKey">
              <SelectTrigger class="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pct">Percentage</SelectItem>
                <SelectItem value="factor">Growth Factor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" class="gap-1.5 cursor-pointer" @click="chartRef?.exportPng()">
              <Download class="size-4" /> .PNG
            </Button>
            <Button @click="exportMarkdown()" variant="outline" class="gap-1.5 cursor-pointer">
              <FileDown class="size-4" /> .MD
            </Button>
          </div>
        </div>

        <Card>
          <CardContent class="p-4">
            <ClientOnly>
              <SeasonalChart ref="chartRef" :profiles="data.profiles" :current-year="data.currentYear" :y-key="yKey" :is-dark="isDark" />
              <template #fallback>
                <Skeleton class="h-[480px] w-full" />
              </template>
            </ClientOnly>
          </CardContent>
        </Card>

        <p class="mt-3 text-xs text-muted-foreground text-right">
          Toggle profiles from the legend · hover to inspect
        </p>

        <div class="mt-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium inline-flex items-center gap-2">
              <Table class="size-4 text-muted-foreground" /> Profiles
            </h2>
          </div>
          <div v-if="data.profiles.length || data.currentYear" class="border rounded-xl divide-y">
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
