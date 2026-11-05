<script setup lang="ts">
import { Copy, Check } from '@lucide/vue'

const route = useRoute()
const symbol = computed(() => route.params.symbol as string)

const { data: md, pending, error } = await useFetch(`/markdown/${symbol.value}`, {
  responseType: 'text',
})

const copied = ref(false)

const bg = computed(() => BRAND_COLORS[symbol.value])

useHead({
  title: computed(() => `${symbol.value} Context | easeason`),
})

async function copyText() {
  if (!md.value) return
  await navigator.clipboard.writeText(md.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader :to="`/explore/${symbol}`" :label="`${symbol} seasonality`" :brand="bg" :symbol="symbol" />

    <main class="mx-auto max-w-4xl px-4 pb-16 pt-10">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <SymbolLogo :symbol="symbol" class="size-11" />
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">{{ symbol }} <span class="font-normal text-muted-foreground">Context</span></h1>
            <p class="mt-1 text-sm text-muted-foreground">Clean markdown summary, ready to paste into your AI tools.</p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          :disabled="!md"
          @click="copyText"
        >
          <Check v-if="copied" class="size-4" />
          <Copy v-else class="size-4" />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>

      <div v-if="pending" class="space-y-3">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-[540px] w-full rounded-2xl" />
      </div>

      <div v-else-if="error" class="py-24 text-center text-sm text-muted-foreground">
        Could not load context for {{ symbol }}.
      </div>

      <pre v-else-if="md" class="surface overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-relaxed text-foreground/90">{{ md }}</pre>
    </main>
  </div>
</template>
