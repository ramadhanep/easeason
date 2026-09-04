<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

interface SeasonalPoint {
  day: number
  pct: number
  factor: number
}

export interface SeasonFilter {
  id: string
  label: string
}

interface SeasonalProfile {
  id: string
  label: string
  years: number[]
  points: SeasonalPoint[]
}

interface CurrentYear {
  year: number
  points: SeasonalPoint[]
}

const props = withDefaults(
  defineProps<{
    profiles: SeasonalProfile[]
    currentYear?: CurrentYear
    seasonFilter?: string
    trumpEnabled?: boolean
    brand?: string
    isDark?: boolean
    symbol?: string
  }>(),
  { isDark: false, symbol: '', currentYear: undefined, seasonFilter: 'all-years', trumpEnabled: false, brand: undefined },
)

const chartRef = ref<InstanceType<typeof VChart> | null>(null)

onMounted(() => {
  chartRef.value?.chart?.setOption({
    dataZoom: [{ type: 'slider', xAxisIndex: 0, start: 0, end: 100, show: false, moveHandleSize: 0 }],
  })
})

function setZoom(end: number) {
  chartRef.value?.chart?.setOption({
    dataZoom: [{ type: 'slider', xAxisIndex: 0, start: 0, end, show: false, moveHandleSize: 0 }],
  })
}

function resetZoom() {
  chartRef.value?.chart?.setOption({
    dataZoom: [{ type: 'slider', xAxisIndex: 0, start: 0, end: 100, show: false, moveHandleSize: 0 }],
  })
}

function exportPng() {
  const chart = chartRef.value
  if (!chart) return
  const bg = props.isDark ? '#0a0a0a' : '#ffffff'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = (chart as any).getDataURL?.({ pixelRatio: 2, backgroundColor: bg })
  if (!url) return
  const link = document.createElement('a')
  link.download = `easeason-seasonality-${props.symbol.toLowerCase()}.png`
  link.href = url
  link.click()
}

defineExpose({ exportPng, setZoom, resetZoom })

const SERIES_COLORS: Record<string, string> = {
  'all-years': '#6b7280',
  'election': '#3b82f6',
  'pre-election': '#10b981',
  'post-election': '#f59e0b',
  'mid-term': '#0ea5e9',
  'trump-years': '#ef4444',
}

function hexChannel(hex: string, shift: number) {
  return (parseInt(hex.slice(1), 16) >> shift) & 255
}

function colorDist(a: string, b: string): number {
  const dr = hexChannel(a, 16) - hexChannel(b, 16)
  const dg = hexChannel(a, 8) - hexChannel(b, 8)
  const db = hexChannel(a, 0) - hexChannel(b, 0)
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

const SEASON_IDS: Array<keyof typeof SERIES_COLORS> = ['pre-election', 'election', 'post-election', 'mid-term']

const FALLBACK_COLORS = [
  '#22c55e', '#06b6d4', '#f97316', '#84cc16', '#d946ef',
  '#14b8a6', '#eab308', '#ec4899', '#a3e635', '#2dd4bf',
  '#fb7185', '#38bdf8', '#a78bfa', '#4ade80', '#fbbf24',
]

function resolvedSeasonColors(brand?: string): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = { ...SERIES_COLORS }
  if (!brand || !brand.startsWith('#')) return out
  const trumpColor = out['trump-years']
  const taken = [trumpColor, brand]
  const MIN_DIST = 110
  for (const id of SEASON_IDS) {
    const base = SERIES_COLORS[id]!
    if (colorDist(base, brand) < MIN_DIST) {
      const alt = FALLBACK_COLORS.find(
        (c) => colorDist(c, brand) >= MIN_DIST && taken.every((t) => colorDist(c, t) >= MIN_DIST),
      )
      out[id] = alt ?? base
      taken.push(out[id])
    } else {
      taken.push(base)
    }
  }
  return out
}

function luminance(hex: string): number {
  const r = hexChannel(hex, 16) / 255
  const g = hexChannel(hex, 8) / 255
  const b = hexChannel(hex, 0) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function visibleBrandColor(brand?: string, isDark?: boolean): string {
  const fallback = isDark ? '#f9fafb' : '#111827'
  if (!brand || !brand.startsWith('#')) return fallback
  const lum = luminance(brand)
  if (isDark) {
    if (lum < 0.4) return blendToLuminance(brand, 0.65)
  } else {
    if (lum > 0.75) return blendToLuminance(brand, 0.4)
  }
  return brand
}

function blendToLuminance(hex: string, target: number): string {
  const r = hexChannel(hex, 16)
  const g = hexChannel(hex, 8)
  const b = hexChannel(hex, 0)
  const cur = luminance(hex)
  if (Math.abs(cur - target) < 0.001) return hex
  const k = (target - cur) / Math.max(cur, 0.0001)
  const br = Math.max(0, Math.min(255, r + 255 * k))
  const bg = Math.max(0, Math.min(255, g + 255 * k))
  const bb = Math.max(0, Math.min(255, b + 255 * k))
  return `#${((br << 16) | (bg << 8) | bb).toString(16).padStart(6, '0')}`
}

const monthLabel = (v: number) => {
  const d = new Date(Date.UTC(2020, 0, 0))
  d.setUTCDate(d.getUTCDate() + v)
  return d.toLocaleString('en-US', { month: 'short' })
}

const option = computed(() => {
  const textColor = props.isDark ? '#e5e9f0' : '#374151'
  const gridColor = props.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipBg = props.isDark ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)'
  const tooltipBorder = props.isDark ? '#374151' : '#e5e7eb'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSeries: any[] = []

  const colors = resolvedSeasonColors(props.brand)

  const filtered = props.seasonFilter !== 'all-years'
    ? props.profiles.filter((p) => p.id === props.seasonFilter)
    : props.profiles

  for (const profile of filtered) {
    const color = colors[profile.id] || '#6b7280'
    allSeries.push({
      name: profile.label,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: profile.points.map((p) => [p.day, p.pct]),
      emphasis: { focus: 'series' },
      lineStyle: { width: 2, color },
      itemStyle: { color },
    })
  }

  if (props.trumpEnabled) {
    const trump = props.profiles.find((p) => p.id === 'trump-years')
    if (trump) {
      const color = colors['trump-years']
      allSeries.push({
        name: trump.label,
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: trump.points.map((p) => [p.day, p.pct]),
        emphasis: { focus: 'series' },
        lineStyle: { width: 2, color },
        itemStyle: { color },
      })
    }
  }

  if (props.currentYear) {
    const curColor = visibleBrandColor(props.brand, props.isDark)
    allSeries.push({
      name: `${props.currentYear.year} YTD`,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: props.currentYear.points.map((p) => [p.day, p.pct]),
      emphasis: { focus: 'series' },
      lineStyle: { width: 2.5, color: curColor, type: 'solid' },
      itemStyle: { color: curColor },
    })
  }

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor, fontSize: 12 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any[]) => {
        if (!params.length) return ''
        const day = params[0].data[0]
        const d = new Date(Date.UTC(2020, 0, 0))
        d.setUTCDate(d.getUTCDate() + day)
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        let html = `<div style="font-weight:500;margin-bottom:4px">${dateStr}</div>`
        for (const p of params) {
          const val = p.data[1]
          const formatted = val.toFixed(2) + '%'
          html += `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${p.color}">${p.seriesName}</span><span>${formatted}</span></div>`
        }
        return html
      },
    },
    grid: {
      left: 56,
      right: 20,
      top: 30,
      bottom: 90,
    },
    legend: {
      bottom: 0,
      height: '140px',
      width: 'calc(100% - 40px)',
      scrollData: true,
      textStyle: { color: textColor, fontSize: 11 },
    },
    xAxis: {
      type: 'value',
      min: 1,
      max: 365,
      axisLabel: { color: textColor, fontSize: 11, formatter: monthLabel },
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        fontSize: 11,
        formatter: (v: number) => v + '%',
      },
      splitLine: { lineStyle: { color: gridColor } },
      axisLine: { show: true, lineStyle: { color: gridColor, width: 1 } },
    },
    series: allSeries,
  }
})
</script>

<template>
  <div class="h-[540px] w-full">
    <VChart
      ref="chartRef"
      :option="option"
      autoresize
      role="img"
      aria-label="Seasonal performance chart. Toggle profiles from the legend."
      class="h-full w-full"
    />
  </div>
</template>
