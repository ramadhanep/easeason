<script setup lang="ts">
const props = defineProps<{
  symbol: string
}>()
</script>

<template>
  <div
    class="relative w-full h-full flex items-center justify-center overflow-hidden"
    style="background-color: #76b900"
  >
    <div class="absolute inset-0 bg-black/15" />
    <span
      class="relative text-3xl sm:text-4xl font-extrabold tracking-tight text-center"
      style="color: #355300"
    >
      {{ props.symbol }}
    </span>
  </div>
</template>
