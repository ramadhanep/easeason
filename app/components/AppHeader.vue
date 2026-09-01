<script setup lang="ts">
import { ArrowLeft, Moon, Sun } from '@lucide/vue'
import { useWindowScroll, useWindowSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
  to: string
  label: string
  brand?: string
}>(), { brand: undefined })

const glass = computed(() => {
  if (!props.brand) return {}
  return {
    backgroundColor: `${props.brand}45`,
    borderColor: `${props.brand}8C`,
    boxShadow: `0 8px 32px ${props.brand}33`,
  }
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const mounted = ref(false)
const { y: scrollY } = useWindowScroll()
const { width: winWidth } = useWindowSize()
const isMobile = computed(() => winWidth.value < 768)
const floating = computed(() => isMobile.value && scrollY.value > 0)
onMounted(() => { mounted.value = true })
</script>

<template>
  <div
    class="w-full mx-auto sm:max-w-2xl"
    :class="floating ? 'fixed inset-x-0 top-3 z-40 px-4' : 'mb-8'"
  >
    <div
      class="rounded-[2rem] border border-white/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden p-2 transition-all duration-300"
      :style="glass"
    >
      <div class="flex items-center justify-between gap-2">
        <NuxtLink
          :to="to"
          class="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/50 dark:bg-white/10 h-12 pl-3 pr-5 text-sm font-medium text-foreground/80 backdrop-blur-xl cursor-pointer"
        >
          <ArrowLeft class="size-5 shrink-0" />
          <span class="truncate">{{ label }}</span>
        </NuxtLink>
        <button
          type="button"
          aria-label="Toggle theme"
          class="rounded-full bg-white/50 dark:bg-white/10 size-12 shrink-0 cursor-pointer"
          @click="colorMode.preference = isDark ? 'light' : 'dark'"
        >
          <Sun v-if="mounted && isDark" class="size-5 mx-auto" />
          <Moon v-else class="size-5 mx-auto" />
        </button>
      </div>
    </div>
  </div>
</template>
