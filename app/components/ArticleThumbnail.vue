<script setup lang="ts">
const props = defineProps<{
  symbol: string
}>()

const THEMES: Record<string, { bg: string; text: string }> = {
  NVDA: { bg: '#14210a', text: '#76b900' },
  AAPL: { bg: '#1d1d1f', text: '#ffffff' },
  'BTC-USD': { bg: '#161616', text: '#f7931a' },
  AMZN: { bg: '#2a1a00', text: '#FF9900' },
  SPY: { bg: '#0D2119', text: '#ffffff' },
  QQQ: { bg: '#001061', text: '#ffffff' },
}

const theme = computed(() => THEMES[props.symbol] ?? { bg: '#14210a', text: '#76b900' })
</script>

<template>
  <div
    class="relative w-full h-full flex items-center justify-center overflow-hidden"
    :style="{ backgroundColor: theme.bg }"
  >
    <div class="absolute inset-0 bg-black/25" />
    <span
      class="relative text-3xl sm:text-4xl font-extrabold tracking-tight text-center"
      :style="{ color: theme.text }"
    >
      {{ props.symbol }}
    </span>
  </div>
</template>
