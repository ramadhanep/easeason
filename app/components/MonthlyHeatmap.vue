<script setup lang="ts">
const props = defineProps<{
  monthly: Array<{ year: number; months: Array<number | null> }>
  currentYear: number
}>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CLAMP = 15 // % at which the colour saturates

const rows = computed(() => [...props.monthly].sort((a, b) => b.year - a.year))

// Summary uses completed years only so a partial current year can't skew it.
const summary = computed(() =>
  MONTHS.map((_, m) => {
    const vals = props.monthly.filter((r) => r.year < props.currentYear).map((r) => r.months[m]).filter((v): v is number => v != null)
    if (!vals.length) return null
    const sorted = [...vals].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return {
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      median: sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2,
      win: (vals.filter((v) => v > 0).length / vals.length) * 100,
    }
  }),
)
const bestMonth = computed(() => {
  let best = -1
  summary.value.forEach((s, i) => { if (s && (best < 0 || s.avg > summary.value[best]!.avg)) best = i })
  return best
})

function cell(v: number | null) {
  if (v == null) return {}
  const a = Math.min(Math.abs(v) / CLAMP, 1)
  const c = v >= 0 ? '16 185 129' : '239 68 68'
  return { backgroundColor: `rgb(${c} / ${(0.08 + a * 0.62).toFixed(2)})` }
}
const f = (v: number | null, d = 1) => (v == null ? '' : `${v > 0 ? '+' : ''}${v.toFixed(d)}`)
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] border-separate border-spacing-[3px] text-xs tabular-nums">
      <thead>
        <tr class="text-muted-foreground">
          <th class="sticky left-0 z-10 w-14 bg-card text-left font-medium" />
          <th v-for="(m, i) in MONTHS" :key="m" class="py-1 text-center font-medium" :class="i === bestMonth ? 'text-foreground' : ''">{{ m }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.year">
          <th class="sticky left-0 z-10 bg-card pr-2 text-left font-mono font-medium text-muted-foreground">{{ r.year }}</th>
          <td
            v-for="(v, m) in r.months"
            :key="m"
            class="h-8 rounded-md text-center font-mono"
            :class="v == null ? 'bg-muted/40' : ''"
            :style="cell(v)"
            :title="v == null ? undefined : `${MONTHS[m]} ${r.year}: ${f(v, 2)}%`"
          >
            {{ f(v) }}
          </td>
        </tr>
        <tr><td :colspan="13" class="h-2" /></tr>
        <tr v-for="[label, key] in ([['Avg %', 'avg'], ['Median %', 'median'], ['Win rate', 'win']] as const)" :key="key">
          <th class="sticky left-0 z-10 bg-card pr-2 text-left font-medium text-muted-foreground">{{ label }}</th>
          <td
            v-for="(s, m) in summary"
            :key="m"
            class="h-8 rounded-md border border-border text-center font-mono font-medium"
            :class="m === bestMonth && key === 'avg' ? 'border-foreground' : ''"
            :style="key === 'win' ? undefined : cell(s ? s[key] : null)"
          >
            {{ s ? (key === 'win' ? `${s.win.toFixed(0)}%` : f(s[key])) : '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
