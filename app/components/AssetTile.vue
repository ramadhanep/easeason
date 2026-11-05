<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

const props = defineProps<{ symbol: string; name: string }>()
const brand = computed(() => BRAND_COLORS[props.symbol])
</script>

<template>
  <NuxtLink
    :to="`/explore/${symbol}`"
    class="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 transition-all active:scale-[0.98] hover:border-[var(--brand,var(--ring))]"
    :style="brand ? { '--brand': brand } : {}"
  >
    <span
      class="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
      :style="{ backgroundColor: brand ?? 'var(--foreground)' }"
    />
    <SymbolLogo :symbol="symbol" class="size-9" />
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-semibold leading-tight">{{ symbol }}</span>
      <span class="mt-0.5 block truncate text-xs text-muted-foreground">{{ name }}</span>
    </span>
    <ArrowUpRight class="size-4 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
  </NuxtLink>
</template>
