---
title: "Research"
description: "Independent notes on market seasonality."
---

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const { data: articles } = await useAsyncData('research-index', () =>
  queryCollection('research')
    .select('title', 'description', 'meta', 'path')
    .all()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((docs: any[]) =>
      docs
        .map((d) => ({ ...d, symbol: d.meta?.tags?.[0] ?? d.title.split(' ')[0] }))
        .sort((a, b) => new Date(b.meta?.publishedOn).getTime() - new Date(a.meta?.publishedOn).getTime()),
    ),
)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <AppHeader to="/" label="Home" />

      <div class="flex items-center gap-2 mb-3">
        <h1 class="text-3xl font-semibold tracking-tight">Research</h1>
      </div>
      <p class="text-muted-foreground mb-12">Independent notes on market seasonality.</p>

      <div class="grid gap-6 sm:grid-cols-2">
        <article
          v-for="a in articles"
          :key="a.path"
          class="group border rounded-xl overflow-hidden hover:bg-muted/40 transition-colors"
        >
          <div class="w-full aspect-[16/8] border-b">
            <ArticleThumbnail :symbol="a.symbol" />
          </div>
          <div class="p-5">
            <h2 class="text-xl font-medium mb-2">
              <NuxtLink :to="a.path" class="hover:text-foreground/80">{{ a.title }}</NuxtLink>
            </h2>
            <p v-if="a.description" class="text-sm text-muted-foreground mb-4">{{ a.description }}</p>
            <p v-if="a.meta?.publishedOn" class="text-xs text-muted-foreground/70 mb-4">{{ new Date(a.meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
            <NuxtLink
              :to="a.path"
              class="inline-flex items-center gap-1.5 text-sm font-medium hover:text-foreground/80"
            >
              Read article
              <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>