<script setup lang="ts">
import { ArrowLeft, Moon, Sun, Copy, Check, FileText } from '@lucide/vue'

const route = useRoute()
const symbol = computed(() => route.params.symbol as string)

const { data: md, pending, error } = await useFetch(`/markdown/${symbol.value}`, {
  responseType: 'text',
})

const copied = ref(false)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => { mounted.value = true })

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
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-3xl px-4 py-8">
      <header class="mb-8 flex items-center justify-between">
        <NuxtLink
          :to="`/explore/${symbol}`"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft class="size-4" /> Explore {{ symbol }}
        </NuxtLink>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          class="rounded-full bg-white/40 dark:bg-white/[0.06] backdrop-blur-xl border border-white/10"
          @click="colorMode.preference = isDark ? 'light' : 'dark'"
        >
          <Sun v-if="mounted && isDark" class="size-5" />
          <Moon v-else class="size-5" />
        </Button>
      </header>

      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
            {{ symbol }} <span class="text-muted-foreground text-base font-normal">Context</span>
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Clean markdown summary ready to paste into your AI tools.
          </p>
        </div>
        <Button variant="outline" size="sm" class="gap-1.5 cursor-pointer rounded-full" @click="copyText" :disabled="!md">
          <Check v-if="copied" class="size-4" />
          <Copy v-else class="size-4" />
          {{ copied ? 'Copied' : 'Copy' }}
        </Button>
      </div>

      <div v-if="pending" class="space-y-3">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-4 w-96" />
        <Skeleton class="h-[480px] w-full" />
      </div>

      <div v-else-if="error" class="py-24 text-center text-sm text-muted-foreground">
        Could not load context for {{ symbol }}.
      </div>

      <pre v-else-if="md" class="whitespace-pre-wrap break-words rounded-2xl border border-border/40 bg-background/40 backdrop-blur-xl p-5 text-sm leading-relaxed text-foreground/90 font-mono shadow-sm">{{ md }}</pre>
    </div>
  </div>
</template>
