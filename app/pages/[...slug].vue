<script setup lang="ts">
useHead({ title: 'Not found | easeason' })
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <AppHeader />
    <main class="mx-auto max-w-md px-4 py-28 text-center">
      <p class="font-mono text-sm text-muted-foreground">404</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p class="mt-3 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <NuxtLink to="/" class="mt-8 inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90">
        Back home
      </NuxtLink>
    </main>
  </div>
</template>
