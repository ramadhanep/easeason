---
title: "Research"
description: "Independent notes on market seasonality."
---

<script setup lang="ts">

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
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Research</h1>
      <p class="mt-2 mb-10 text-muted-foreground">Independent notes on market seasonality.</p>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ArticleCard v-for="a in articles" :key="a.path" :article="a" />
      </div>
    </main>
  </div>
</template>
