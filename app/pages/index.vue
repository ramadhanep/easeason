<script setup lang="ts">
import { Moon, Sun, Search, Landmark, Bitcoin, Globe2, Database, TrendingUp, FileText, ArrowRight } from '@lucide/vue'

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

const popular = ['NVDA', 'BTC-USD', 'SPY', 'QQQ', 'ETH-USD']
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-16">
      <div class="text-center mb-10">
        <div class="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            @click="colorMode.preference = isDark ? 'light' : 'dark'"
          >
            <Sun v-if="mounted && isDark" class="size-4" />
            <Moon v-else class="size-4" />
          </Button>
        </div>

        <div class="flex items-center justify-center mb-4">
          <span class="inline-flex items-center justify-center size-10 rounded-xl border bg-card">
            <TrendingUp class="size-5" />
          </span>
        </div>
        <h1 class="text-4xl font-semibold tracking-tight mb-3">easeason</h1>
        <p class="text-lg text-muted-foreground">Explore historical market seasonality.</p>
        <p class="text-sm text-muted-foreground mt-1">
          See how stocks, crypto, and indices historically move throughout the year.
        </p>
      </div>

      <Popover v-model:open="searchOpen">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded="searchOpen"
            class="w-full h-12 justify-start gap-3 px-4 text-muted-foreground font-normal"
          >
            <Search class="size-4" />
            Search stocks, crypto, indices...
            <span class="ml-auto hidden sm:inline-flex text-xs text-muted-foreground/60">⌘K</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[calc(100vw-2rem)] sm:w-[32rem] p-0" align="start" :side-offset="8">
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

      <div v-if="!searchOpen" class="mt-8">
        <p class="text-xs uppercase tracking-wide text-muted-foreground mb-3">Popular</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="sym in popular"
            :key="sym"
            class="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm hover:bg-muted transition-colors"
            @click="router.push(`/explore/${sym}`)"
          >
            {{ sym }}
          </button>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
        <div class="border rounded-lg p-4 flex flex-col items-center gap-1.5">
          <Landmark class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">US Stocks</span>
        </div>
        <div class="border rounded-lg p-4 flex flex-col items-center gap-1.5">
          <Bitcoin class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Crypto</span>
        </div>
        <div class="border rounded-lg p-4 flex flex-col items-center gap-1.5">
          <Globe2 class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">IDX Stocks</span>
        </div>
        <div class="border rounded-lg p-4 flex flex-col items-center gap-1.5">
          <Database class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Indices</span>
        </div>
      </div>

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
