<script setup lang="ts">
import { ArrowLeft, Moon, Sun } from '@lucide/vue'

const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('research').path(route.path).first(),
)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => { mounted.value = true })

useHead({
  title: page.value?.title ? `${page.value.title} | easeason` : 'easeason',
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-3xl px-4 py-16">
      <header class="mb-10 flex items-center justify-between">
        <NuxtLink to="/research" class="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft class="size-4" /> Research
        </NuxtLink>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          @click="colorMode.preference = isDark ? 'light' : 'dark'"
        >
          <Sun v-if="mounted && isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
      </header>

      <div v-if="page">
        <ContentRenderer :value="page" class="prose-ease" />
      </div>
      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        Article not found.
      </div>
    </div>
  </div>
</template>