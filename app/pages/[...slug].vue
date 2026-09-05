<script setup lang="ts">
useHead({ title: 'Not found | easeason' })
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-2xl px-4 py-8">
      <AppHeader to="/" label="Home" />
      <div class="py-24 text-center">
        <h1 class="text-3xl font-semibold tracking-tight mb-3">Page not found</h1>
        <p class="text-sm text-muted-foreground mb-6">The page you are looking for does not exist.</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center rounded-full border border-input bg-transparent px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Back home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>