<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('research').path(route.path).first(),
)

const backPath = computed(() => {
  const from = (route.meta as any).from as string | undefined
  if (from && from.startsWith('/explore')) return '/'
  if (from === '/') return '/'
  return '/research'
})
const backLabel = computed(() => (backPath.value === '/' ? 'Home' : 'Research'))

useHead({
  title: page.value?.title ? `${page.value.title} | easeason` : 'easeason',
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-3xl px-4 py-16">
      <AppHeader :to="backPath" :label="backLabel" />

      <div v-if="page">
        <ContentRenderer :value="page" class="prose-ease" />
      </div>
      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        Article not found.
      </div>
    </div>
  </div>
</template>