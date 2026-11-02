<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const props = defineProps<{
  symbol: string
  name: string
  outlook?: { spark: number[]; todayIdx: number; next30: number }
}>()
const brand = computed(() => BRAND_COLORS[props.symbol])

const W = 100
const H = 28
const spark = computed(() => {
  const s = props.outlook?.spark
  if (!s || s.length < 2) return null
  const min = Math.min(...s)
  const span = Math.max(...s) - min || 1
  const xy = (v: number, i: number) => [(i / (s.length - 1)) * W, H - 2 - ((v - min) / span) * (H - 4)] as const
  const pts = s.map((v, i) => xy(v, i))
  const [tx, ty] = pts[props.outlook!.todayIdx]!
  return { d: pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '), tx, ty }
})
const up = computed(() => (props.outlook?.next30 ?? 0) >= 0)
</script>

<template>
  <NuxtLink
    :to="`/explore/${symbol}`"
    class="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--brand,var(--border))] hover:shadow-md"
    :style="brand ? { '--brand': brand, backgroundImage: `linear-gradient(135deg, ${brand}24 0%, transparent 65%)` } : {}"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="flex min-w-0 items-center gap-2">
        <span class="size-2 shrink-0 rounded-full bg-muted-foreground/40" :style="brand ? { backgroundColor: brand } : {}" />
        <span class="truncate text-base font-bold">{{ symbol }}</span>
      </span>
      <ArrowRight class="size-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
    </div>
    <span class="mt-1 truncate text-xs text-muted-foreground">{{ name }}</span>
    <div v-if="spark" class="mt-3 flex items-end justify-between gap-2">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-7 min-w-0 flex-1" aria-hidden="true">
        <path :d="spark.d" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke" class="text-muted-foreground/60" />
        <circle :cx="spark.tx" :cy="spark.ty" r="2.5" :fill="brand ?? 'currentColor'" stroke="var(--foreground)" stroke-width="1" vector-effect="non-scaling-stroke" />
      </svg>
      <span
        class="shrink-0 font-mono text-xs font-medium"
        :class="up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
        :title="'Historical average move over the next 30 days'"
      >{{ up ? '+' : '' }}{{ outlook!.next30.toFixed(1) }}%</span>
    </div>
  </NuxtLink>
</template>
