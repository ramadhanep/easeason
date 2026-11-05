<script setup lang="ts">
import { Search, ArrowRight } from '@lucide/vue'

const props = withDefaults(defineProps<{ placeholder?: string; variant?: 'compact' | 'hero' }>(), { placeholder: undefined, variant: 'compact' })

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
      <button
        type="button"
        role="combobox"
        :aria-expanded="open"
        aria-label="Search assets"
        class="inline-flex cursor-pointer items-center gap-3 border border-border bg-muted/50 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted"
        :class="props.variant === 'hero'
          ? 'h-14 w-full rounded-2xl bg-card px-5 text-base shadow-sm'
          : 'size-9 justify-center rounded-lg sm:w-56 sm:justify-start sm:px-3 text-sm'"
      >
        <Search class="shrink-0" :class="props.variant === 'hero' ? 'size-5' : 'size-4'" />
        <span class="min-w-0 truncate" :class="props.variant === 'hero' ? '' : 'hidden sm:inline'">{{ placeholder ?? 'Search stocks, crypto, indices…' }}</span>
        <kbd class="ml-auto hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">⌘K</kbd>
      </button>
    </PopoverTrigger>
    <PopoverContent
      class="w-[calc(100vw-2rem)] sm:w-[32rem] p-0 rounded-xl overflow-hidden backdrop-blur-2xl"
      align="end"
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
