<script setup lang="ts">
import { X, Plus } from '@lucide/vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { monthLabel, computeStats, type SeasonalData } from '#shared/seasonal'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])
useHead({ title: 'Compare | easeason' })

const route = useRoute()
const MAX = 3
const symbols = ref<string[]>(
  [route.query.a, route.query.b, route.query.c].filter((v): v is string => typeof v === 'string' && !!v).slice(0, MAX),
)
const tab = ref<'full-seasons' | 'all-years'>(route.query.tab === 'full-seasons' ? 'full-seasons' : 'all-years')

watch([symbols, tab], ([syms, t]) => {
  navigateTo({ query: { a: syms[0], b: syms[1], c: syms[2], tab: t === 'all-years' ? undefined : t }, replace: true })
}, { deep: true })

const results = ref<Record<string, SeasonalData | 'error'>>({})
const loading = ref(false)

watch(symbols, async (syms) => {
  const missing = syms.filter((s) => !results.value[s])
  if (!missing.length) return
  loading.value = true
  await Promise.all(missing.map(async (s) => {
    try { results.value[s] = await $fetch<SeasonalData>('/api/seasonal', { query: { symbol: s } }) }
    catch { results.value[s] = 'error' }
  }))
  loading.value = false
}, { immediate: true, deep: true })

function add(s: string) {
  if (!symbols.value.includes(s) && symbols.value.length < MAX) symbols.value = [...symbols.value, s]
}
function remove(s: string) { symbols.value = symbols.value.filter((x) => x !== s) }

const FALLBACK = ['#3b82f6', '#f59e0b', '#10b981']
const colorFor = (s: string, i: number) => {
  const b = BRAND_COLORS[s]
  return b && !symbols.value.slice(0, i).some((o) => BRAND_COLORS[o] === b) ? b : FALLBACK[i]!
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const ready = computed(() => symbols.value
  .map((s, i) => ({ s, i, r: results.value[s] }))
  .filter((x): x is { s: string; i: number; r: SeasonalData } => !!x.r && x.r !== 'error' && x.r.profiles?.some((p) => p.id === tab.value)))

const rows = computed(() => ready.value.map(({ s, i, r }) => {
  const p = r.profiles.find((p) => p.id === tab.value)!
  return { symbol: s, color: colorFor(s, i), profile: p, stats: computeStats(s, p.points) }
}))

const option = computed(() => {
  const text = isDark.value ? '#e5e9f0' : '#374151'
  const grid = isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const full = tab.value === 'full-seasons'
  return {
    backgroundColor: 'transparent',
    animationDurationUpdate: 0,
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      textStyle: { color: text, fontSize: 12 },
      formatter: (params: Array<{ data: [number, number]; color: string; seriesName: string }>) => {
        if (!params.length) return ''
        const day = params[0]!.data[0]
        const head = full ? `Day ${day}` : monthLabel(day)
        return `<div style="font-weight:500;margin-bottom:4px">${head}</div>` + params.map((p) =>
          `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${p.color}">${p.seriesName}</span><span>${p.data[1].toFixed(2)}%</span></div>`).join('')
      },
    },
    grid: { left: 56, right: 20, top: 20, bottom: 40 },
    legend: { bottom: 0, textStyle: { color: text, fontSize: 11 } },
    xAxis: {
      type: 'value', min: 1, max: full ? 1461 : 365,
      axisLabel: { color: text, fontSize: 11, formatter: (v: number) => full ? `Y${Math.ceil(v / 365.25)}` : monthLabel(v).split(' ')[0] },
      splitLine: { show: false }, axisTick: { show: false }, axisLine: { lineStyle: { color: grid } },
    },
    yAxis: { type: 'value', axisLabel: { color: text, fontSize: 11, formatter: (v: number) => `${v}%` }, splitLine: { lineStyle: { color: grid } } },
    series: rows.value.map((r) => ({
      id: r.symbol, name: r.symbol, type: 'line', showSymbol: false, smooth: true,
      data: r.profile.points.map((p) => [p.day, p.pct]),
      lineStyle: { width: 2.5, color: r.color }, itemStyle: { color: r.color },
    })),
  }
})

const fmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
const failed = computed(() => symbols.value.filter((s) => results.value[s] === 'error'))
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Compare</h1>
      <p class="mt-2 text-muted-foreground">Overlay the seasonal path of up to {{ MAX }} assets.</p>

      <div class="mt-6 flex flex-wrap items-center gap-2">
        <span
          v-for="(s, i) in symbols"
          :key="s"
          class="inline-flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-2.5 pr-1.5 text-sm font-medium"
        >
          <span class="size-2 rounded-full" :style="{ backgroundColor: colorFor(s, i) }" />
          {{ s }}
          <button type="button" class="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" :aria-label="`Remove ${s}`" @click="remove(s)">
            <X class="size-3.5" />
          </button>
        </span>
        <div v-if="symbols.length < MAX" class="w-64">
          <SymbolSearch pick :placeholder="symbols.length ? 'Add asset…' : 'Pick an asset…'" @select="add" />
        </div>
        <div class="ml-auto">
          <SegmentedControl
            v-model="tab"
            :options="[{ id: 'all-years', label: 'All Seasons' }, { id: 'full-seasons', label: 'Full Seasons' }]"
            @update:model-value="tab = $event as typeof tab"
          />
        </div>
      </div>

      <p v-if="failed.length" class="mt-4 text-sm text-destructive">Could not load {{ failed.join(', ') }}.</p>

      <div v-if="!symbols.length" class="surface mt-8 flex flex-col items-center gap-2 py-24 text-center text-muted-foreground">
        <Plus class="size-6" />
        <p class="text-sm">Add at least two assets to compare their seasonality.</p>
      </div>

      <template v-else>
        <section class="surface mt-6 p-3 sm:p-4">
          <div class="h-[400px] w-full sm:h-[480px]">
            <ClientOnly>
              <VChart v-if="rows.length" :option="option" autoresize role="img" aria-label="Seasonal comparison chart" class="h-full w-full" />
              <Skeleton v-else-if="loading" class="h-full w-full" />
              <template #fallback><Skeleton class="h-full w-full" /></template>
            </ClientOnly>
          </div>
          <p v-if="!loading && symbols.length && !rows.length" class="py-8 text-center text-sm text-muted-foreground">
            No {{ tab === 'full-seasons' ? 'Full Seasons' : 'All Seasons' }} data for the selected assets. Try the other view.
          </p>
        </section>

        <section v-if="rows.length" class="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b bg-muted/50 text-xs text-muted-foreground">
                  <th class="px-4 py-2.5 text-left font-medium">Asset</th>
                  <th class="px-4 py-2.5 text-right font-medium">End of period</th>
                  <th class="px-4 py-2.5 text-right font-medium">Peak</th>
                  <th class="px-4 py-2.5 text-right font-medium">Trough</th>
                  <th class="px-4 py-2.5 text-right font-medium">Days positive</th>
                  <th class="px-4 py-2.5 text-right font-medium">Years</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.symbol" class="border-b last:border-0">
                  <td class="px-4 py-2.5 font-medium">
                    <NuxtLink :to="`/explore/${r.symbol}`" class="inline-flex items-center gap-2 hover:underline">
                      <SymbolLogo :symbol="r.symbol" class="size-5" /> {{ r.symbol }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 py-2.5 text-right font-mono" :class="r.stats.end >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ fmt(r.stats.end) }}</td>
                  <td class="px-4 py-2.5 text-right font-mono">{{ fmt(r.stats.best) }}</td>
                  <td class="px-4 py-2.5 text-right font-mono">{{ fmt(r.stats.worst) }}</td>
                  <td class="px-4 py-2.5 text-right font-mono">{{ r.stats.winRate.toFixed(0) }}%</td>
                  <td class="px-4 py-2.5 text-right font-mono text-muted-foreground">{{ r.profile.years.length ? `${Math.min(...r.profile.years)}–${Math.max(...r.profile.years)}` : '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
