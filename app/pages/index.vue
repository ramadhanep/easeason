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
  queryCollection('research').select('title', 'description', 'path').order('path', 'ASC').all(),
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
            class="inline-flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm hover:bg-muted transition-colors cursor-pointer"
            @click="router.push(`/explore/${sym}`)"
          >
            {{ sym }}
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
            <div class="aspect-[16/8] bg-muted/40 border-b flex items-center justify-center">
              <img v-if="a.image" :src="a.image" :alt="a.title" class="w-full h-full object-cover" />
              <FileText v-else class="size-6 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
            </div>
            <div class="p-4">
              <h3 class="font-medium leading-snug group-hover:text-foreground/80">{{ a.title }}</h3>
              <p v-if="a.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ a.description }}</p>
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
