import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Non-UTC zone (Jan 1 00:00 UTC is still Dec 31 here) so local-time Date bugs fail tests.
  test: { env: { TZ: 'America/New_York' } },
  resolve: {
    alias: {
      '#shared': new URL('./shared', import.meta.url).pathname,
    },
  },
})
