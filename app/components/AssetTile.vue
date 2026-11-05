<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const props = defineProps<{ symbol: string; name: string }>()
const brand = computed(() => BRAND_COLORS[props.symbol])
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
  </NuxtLink>
</template>
