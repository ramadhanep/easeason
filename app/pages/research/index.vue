---
title: "Research"
description: "Independent notes on market seasonality."
---

<script setup lang="ts">

const { data: articles } = await useResearchArticles('research-index')
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
