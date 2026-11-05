<script setup lang="ts">
import { SUPABASE_BASE_URL } from '~/lib/config'

const props = withDefaults(defineProps<{ symbol?: string; class?: string }>(), { symbol: undefined, class: '' })

const fallback = '/aruna.png'
const url = computed(() => {
  const s = props.symbol
  if (!s) return fallback
  if (s.endsWith('.JK')) return `${SUPABASE_BASE_URL}/idx/${s.replace('.JK', '')}.png`
  if (s.endsWith('-USD')) return `https://www.bybit.com/bycsi-root/assets/image/coins/light/${s.replace('-USD', '').toLowerCase()}.svg`
  return `${SUPABASE_BASE_URL}/us/${s}.svg`
})
</script>

<template>
  <img
    :src="url"
    :alt="symbol ?? 'easeason'"
    loading="lazy"
    class="shrink-0 rounded-full bg-white object-cover ring-1 ring-black/5"
    :class="props.class || 'size-8'"
    @error="(e) => { (e.target as HTMLImageElement).src = fallback }"
  >
</template>
