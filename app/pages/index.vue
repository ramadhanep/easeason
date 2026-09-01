<script setup lang="ts">
import { Moon, Sun, Search, FileText, ArrowRight } from '@lucide/vue'

const router = useRouter()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      searchOpen.value = !searchOpen.value
    }
  }
  window.addEventListener('keydown', onKey)
})

const { data: groups } = await useFetch('/api/symbols')

const { data: articles } = await useAsyncData('home-research', () =>
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

const searchOpen = ref(false)
const searchQuery = ref('')

const groupedSymbols = computed(() => {
  if (!groups.value) return []
  return Object.values(groups.value)
    .filter((g) => g.items.length)
    .map((g) => ({ label: g.label, items: g.items }))
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return groupedSymbols.value.map((g) => ({
    label: g.label,
    items: q
      ? g.items.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      : g.items,
  })).filter((g) => g.items.length)
})

function selectSymbol(symbol: string) {
  searchOpen.value = false
  searchQuery.value = ''
  router.push(`/explore/${symbol}`)
}

const popular = ['SPY', 'QQQ', 'BTC-USD', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AAPL', 'AVGO', 'ETH-USD']

const nameFor = (symbol: string) => {
  for (const g of groupedSymbols.value) {
    const item = g.items.find((s) => s.symbol === symbol)
    if (item) return item.name
  }
  return symbol
}
</script>

<template>
  <div class="min-h-screen relative bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <div class="fixed inset-x-0 top-3 z-40 flex justify-center px-4 pointer-events-none">
        <div
          class="w-full max-w-2xl pointer-events-auto rounded-[2rem] border border-white/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden p-2 transition-all duration-300 ease-out"
        >
        <div class="flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <Popover v-model:open="searchOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded="searchOpen"
                  class="w-full h-12 justify-start gap-3 rounded-[1.5rem] bg-white/50 dark:bg-white/10 px-4 text-muted-foreground font-normal backdrop-blur-xl"
                >
                  <Search class="size-4 shrink-0" />
                  <span class="truncate min-w-0">Search stocks, crypto, indices...</span>
                  <span class="ml-auto shrink-0 hidden sm:inline-flex text-xs text-muted-foreground/60">⌘K</span>
                </Button>
              </PopoverTrigger>
            <PopoverContent class="w-[calc(100vw-2rem)] sm:w-[32rem] p-0 rounded-[1.25rem] overflow-hidden backdrop-blur-2xl" align="start" :side-offset="10">
              <Command v-model:search-term="searchQuery">
                <CommandInput placeholder="Search stocks, crypto, indices..." />
                <CommandList>
                  <CommandEmpty>No assets found.</CommandEmpty>
                  <template v-for="g in filtered" :key="g.label">
                    <CommandGroup :heading="g.label">
                      <CommandItem
                        v-for="s in g.items"
                        :key="s.symbol"
                        :value="s.symbol"
                        class="flex items-center justify-between gap-3"
                        @select="selectSymbol(s.symbol)"
                      >
                        <span class="flex items-center gap-2">
                          <span class="font-medium">{{ s.symbol }}</span>
                          <span class="text-sm text-muted-foreground truncate">{{ s.name }}</span>
                        </span>
                        <ArrowRight class="size-4 text-muted-foreground/60" />
                      </CommandItem>
                    </CommandGroup>
                  </template>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <a
          href="https://github.com/ramadhanep/easeason"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          class="inline-flex items-center justify-center rounded-full bg-white/50 dark:bg-white/10 size-12 shrink-0 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z"/>
          </svg>
        </a>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          class="rounded-full bg-white/50 dark:bg-white/10 size-12 shrink-0 cursor-pointer"
          @click="colorMode.preference = isDark ? 'light' : 'dark'"
        >
          <Sun v-if="mounted && isDark" class="size-5" />
          <Moon v-else class="size-5" />
        </Button>
        </div>
      </div>
      </div>
      <div class="h-20" aria-hidden="true"/>

      <div class="text-center">
        <h2 class="text-3xl font-semibold tracking-tight">easeason</h2>
        <p class="text-sm text-muted-foreground mt-2">
          Research/visualization tool for exploring how assets have historically moved throughout the year, including U.S. presidential election-cycle patterns.
        </p>
      </div>

      <div class="mt-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">Popular</h2>
          <span class="text-xs text-muted-foreground">Tap to explore</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="sym in popular"
            :key="sym"
            class="group flex flex-col justify-between rounded-2xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            :style="{ backgroundColor: BRAND_COLORS[sym], color: brandTextColor(BRAND_COLORS[sym]) }"
            @click="router.push(`/explore/${sym}`)"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-base">{{ sym }}</span>
              <ArrowRight class="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <span class="mt-1 text-xs opacity-70 truncate">{{ nameFor(sym) }}</span>
          </button>
        </div>
      </div>

      <section class="mt-14">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">Latest research</h2>
          <NuxtLink to="/research" class="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="a in articles"
            :key="a.path"
            :to="a.path"
            class="group border rounded-xl overflow-hidden hover:bg-muted/40 transition-colors"
          >
            <div class="aspect-[16/8] border-b">
              <ArticleThumbnail :symbol="a.symbol" />
            </div>
            <div class="p-4">
              <h3 class="font-medium leading-snug group-hover:text-foreground/80">{{ a.title }}</h3>
              <p v-if="a.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ a.description }}</p>
              <p v-if="a.meta?.publishedOn" class="mt-2 text-xs text-muted-foreground/70">{{ new Date(a.meta.publishedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <footer class="mt-14 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        <NuxtLink to="/research" class="inline-flex items-center gap-1 hover:text-foreground">
          <FileText class="size-3.5" /> Research
        </NuxtLink>
        <span class="mx-2">·</span>
        Historical statistics, not financial advice.
      </footer>
    </div>
  </div>
</template>
