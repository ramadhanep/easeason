<script setup lang="ts">
import { ArrowLeft, Moon, Sun } from '@lucide/vue'

defineProps<{
  to?: string
  label?: string
  brand?: string
  symbol?: string
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const iconBtn = 'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/70 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
      <NuxtLink
        v-if="to"
        :to="to"
        class="-ml-2 inline-flex min-w-0 shrink items-center gap-2 rounded-lg py-1.5 pl-2 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft class="size-4 shrink-0" />
        <SymbolLogo v-if="symbol" :symbol="symbol" class="size-5" />
        <span class="truncate">{{ label }}</span>
      </NuxtLink>
      <NuxtLink v-else to="/" class="-ml-1 inline-flex items-center gap-2 rounded-lg px-1 py-1 font-semibold tracking-tight">
        <img src="/aruna.png" alt="" class="size-6 rounded-full object-cover">
        easeason
      </NuxtLink>

      <nav class="ml-4 hidden items-center gap-1 text-sm sm:flex" aria-label="Main">
        <NuxtLink to="/explore" class="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" active-class="!text-foreground">Explore</NuxtLink>
        <NuxtLink to="/compare" class="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" active-class="!text-foreground">Compare</NuxtLink>
        <NuxtLink to="/research" class="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" active-class="!text-foreground">Research</NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <SymbolSearch />
        <a
          href="https://github.com/ramadhanep/easeason"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          :class="iconBtn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-[18px]" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z"/>
          </svg>
        </a>
        <button type="button" aria-label="Toggle theme" :class="iconBtn" @click="colorMode.preference = isDark ? 'light' : 'dark'">
          <Sun v-if="mounted && isDark" class="size-[18px]" />
          <Moon v-else class="size-[18px]" />
        </button>
      </div>
    </div>
    <div v-if="brand" class="absolute inset-x-0 bottom-0 h-px" :style="{ background: `linear-gradient(90deg, transparent, ${brand}, transparent)` }" />
  </header>
</template>
