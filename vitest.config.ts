import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#shared': new URL('./shared', import.meta.url).pathname,
    },
  },
})
