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
    <div class="mx-auto max-w-5xl px-4 py-16">
      <header class="mb-12 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft class="size-4" /> Home
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
        <h1 class="text-3xl font-semibold tracking-tight">Research</h1>
      </div>
      <p class="text-muted-foreground mb-12">Independent notes on market seasonality.</p>

      <div class="grid gap-6 sm:grid-cols-2">
        <article
          v-for="a in articles"
          :key="a.path"
          class="group border rounded-xl overflow-hidden hover:bg-muted/40 transition-colors"
        >
          <div class="w-full aspect-[16/8] bg-muted/40 border-b flex items-center justify-center">
            <img v-if="a.image" :src="a.image" :alt="a.title" class="w-full h-full object-cover" />
            <BookOpen v-else class="size-7 text-muted-foreground/40" />
          </div>
          <div class="p-5">
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
          </div>
        </article>
      </div>
    </div>
  </div>
</template>