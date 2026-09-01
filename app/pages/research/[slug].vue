<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('research').path(route.path).first(),
)

const backPath = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (route.meta as any).from as string | undefined
  if (from && from.startsWith('/explore')) return from
  if (from === '/') return '/'
  return '/research'
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const meta = computed<Record<string, any>>(() => (page.value?.meta as any) ?? {})
const symbolTag = computed(() => {
  const tags = (meta.value.tags ?? []) as string[]
  const symbolTags = tags.filter((t) => t in BRAND_COLORS)
  return symbolTags.length ? symbolTags[symbolTags.length - 1] : ''
})
const backSymbol = computed(() => symbolTag.value)
const brand = computed(() => BRAND_COLORS[symbolTag.value])
const backLabel = computed(() => {
  if (backPath.value.startsWith('/explore')) return `Explore ${backSymbol.value}`
  return backPath.value === '/' ? 'Home' : 'Research'
})

useHead({
  title: page.value?.title ? `${page.value.title} | easeason` : 'easeason',
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-3xl px-4 py-16">
      <AppHeader :to="backPath" :label="backLabel" :brand="brand" />

      <div v-if="page">
        <div v-if="meta.publishedOn" class="text-sm text-muted-foreground mb-6">
          {{ new Date(meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </div>
        <ContentRenderer :value="page" class="prose-ease" />
      </div>
      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        Article not found.
      </div>
    </div>
  </div>
</template>