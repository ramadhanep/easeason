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
  <div class="inline-flex shrink-0 items-center gap-0.5 rounded-xl bg-muted p-1" role="group">
    <button
      v-for="o in options"
      :key="o.id"
      type="button"
      class="cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all sm:py-1.5"
      :class="modelValue === o.id ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      :style="modelValue === o.id ? { backgroundColor: brand ?? 'var(--background)', color: fg } : {}"
      :aria-pressed="modelValue === o.id"
      @click="$emit('update:modelValue', o.id)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
