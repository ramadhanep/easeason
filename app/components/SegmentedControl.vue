<script setup lang="ts">
defineProps<{
  options: { id: string | number; label: string }[]
  modelValue: string | number | null
  brand?: string
  fg?: string
}>()
defineEmits<{ 'update:modelValue': [id: string | number] }>()
</script>

<template>
  <div class="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted p-1">
    <button
      v-for="o in options"
      :key="o.id"
      type="button"
      class="cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:py-1.5"
      :class="modelValue === o.id ? '' : 'text-muted-foreground hover:text-foreground'"
      :style="modelValue === o.id ? { backgroundColor: brand ?? 'var(--background)', color: fg } : {}"
      :aria-pressed="modelValue === o.id"
      @click="$emit('update:modelValue', o.id)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
