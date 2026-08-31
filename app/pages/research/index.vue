---
title: "Research"
description: "Independent notes on market seasonality."
---

<script setup lang="ts">
import { ArrowLeft, ArrowRight, BookOpen, Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const { data: articles } = await useAsyncData('research-index', () =>
  queryCollection('research')
    .select('title', 'description', 'path')
    .order('path', 'ASC')
    .all(),
)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-3xl px-4 py-16">
      <header class="mb-12 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft class="size-4" /> easeason
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

      <div class="flex items-center gap-2 mb-3">
        <BookOpen class="size-5 text-muted-foreground" />
        <h1 class="text-3xl font-semibold tracking-tight">Research</h1>
      </div>
      <p class="text-muted-foreground mb-12">Independent notes on market seasonality.</p>

      <div class="grid gap-6">
        <article
          v-for="a in articles"
          :key="a.path"
          class="group border rounded-xl p-6 hover:bg-muted/40 transition-colors"
        >
          <h2 class="text-xl font-medium mb-2">
            <NuxtLink :to="a.path" class="hover:text-foreground/80">{{ a.title }}</NuxtLink>
          </h2>
          <p v-if="a.description" class="text-sm text-muted-foreground mb-4">{{ a.description }}</p>
          <NuxtLink
            :to="a.path"
            class="inline-flex items-center gap-1.5 text-sm font-medium hover:text-foreground/80"
          >
            Read article
            <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </article>
      </div>
    </div>
  </div>
</template>