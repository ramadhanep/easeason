<script setup lang="ts">
import { Search, ArrowRight } from '@lucide/vue'

defineProps<{ placeholder?: string }>()

const router = useRouter()
const { data: groups } = await useFetch('/api/symbols')

const open = ref(false)
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return Object.values(groups.value ?? {})
    .map((g) => ({
      label: g.label,
      items: q ? g.items.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length)
})

function select(symbol: string) {
  open.value = false
  query.value = ''
  router.push(`/explore/${symbol}`)
}

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        role="combobox"
        :aria-expanded="open"
        aria-label="Search assets"
        class="size-12 sm:w-full justify-center sm:justify-start gap-3 rounded-full sm:rounded-[1.5rem] bg-white/50 dark:bg-white/10 sm:px-4 p-0 text-muted-foreground font-normal backdrop-blur-xl"
      >
        <Search class="size-4 shrink-0" />
        <span class="hidden sm:inline truncate min-w-0">{{ placeholder ?? 'Search stocks, crypto, indices...' }}</span>
        <span class="ml-auto shrink-0 hidden sm:inline-flex text-xs text-muted-foreground/60">⌘K</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-[calc(100vw-2rem)] sm:w-[32rem] p-0 rounded-[1.25rem] overflow-hidden backdrop-blur-2xl"
      align="start"
      :side-offset="10"
      :collision-padding="16"
    >
      <Command v-model:search-term="query">
        <CommandInput placeholder="Search stocks, crypto, indices..." />
        <CommandList>
          <CommandEmpty>No assets found.</CommandEmpty>
          <CommandGroup v-for="g in filtered" :key="g.label" :heading="g.label">
            <CommandItem
              v-for="s in g.items"
              :key="s.symbol"
              :value="s.symbol"
              class="flex items-center justify-between gap-3"
              @select="select(s.symbol)"
            >
              <span class="flex items-center gap-2 min-w-0">
                <span class="font-medium">{{ s.symbol }}</span>
                <span class="text-sm text-muted-foreground truncate">{{ s.name }}</span>
              </span>
              <ArrowRight class="size-4 shrink-0 text-muted-foreground/60" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
