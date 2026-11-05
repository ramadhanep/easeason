<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

defineProps<{
  article: { path: string; title: string; description?: string; symbol: string; meta?: { publishedOn?: string } }
}>()
</script>

<template>
  <NuxtLink
    :to="article.path"
    class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/25"
  >
    <div class="aspect-[16/8] overflow-hidden border-b border-border">
      <ArticleThumbnail :symbol="article.symbol" class="transition-transform duration-500 group-hover:scale-[1.03]" />
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-semibold leading-snug tracking-tight">{{ article.title }}</h3>
      <p v-if="article.description" class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ article.description }}</p>
      <div class="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
        <span v-if="article.meta?.publishedOn">{{ new Date(article.meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
        <span class="inline-flex items-center gap-1 font-medium text-foreground">Read <ArrowRight class="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </div>
  </NuxtLink>
</template>
