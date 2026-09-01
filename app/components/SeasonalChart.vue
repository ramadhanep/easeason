<script setup lang="ts">
import { computed, ref } from 'vue'
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
    yKey?: 'pct' | 'factor'
    isDark?: boolean
    symbol?: string
  }>(),
  { yKey: 'pct', isDark: false, symbol: '' },
)

const chartRef = ref<VChart | null>(null)

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

defineExpose({ exportPng })

const SERIES_COLORS: Record<string, string> = {
  'all-years': '#6b7280',
  'election': '#3b82f6',
  'pre-election': '#10b981',
  'mid-term': '#ef4444',
  'post-election': '#f59e0b',
  'trump-years': '#8b5cf6',
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

  for (const profile of props.profiles) {
    const color = SERIES_COLORS[profile.id] || '#6b7280'
    allSeries.push({
      name: profile.label,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: profile.points.map((p) => [p.day, props.yKey === 'pct' ? p.pct : p.factor]),
      emphasis: { focus: 'series' },
      lineStyle: { width: 2, color },
      itemStyle: { color },
    })
  }

  if (props.currentYear) {
    const curColor = props.isDark ? '#f9fafb' : '#111827'
    allSeries.push({
      name: `${props.currentYear.year} YTD`,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: props.currentYear.points.map((p) => [p.day, props.yKey === 'pct' ? p.pct : p.factor]),
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
          const formatted = props.yKey === 'pct' ? val.toFixed(2) + '%' : val.toFixed(3) + 'x'
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
      type: props.yKey === 'pct' ? 'value' : 'log',
      axisLabel: {
        color: textColor,
        fontSize: 11,
        formatter: (v: number) => (props.yKey === 'pct' ? v + '%' : v + 'x'),
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
    <VChart ref="chartRef" :option="option" autoresize class="h-full w-full" />
  </div>
</template>
