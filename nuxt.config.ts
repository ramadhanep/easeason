export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/content', '@vite-pwa/nuxt', '@nuxt/eslint'],
  colorMode: {
    classSuffix: '',
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'easeason',
      short_name: 'easeason',
      description:
        'Research tool for exploring how assets move throughout the year, including U.S. presidential election-cycle patterns.',
      lang: 'en',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0a0a0a',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
  app: {
    head: {
      title: 'easeason',
      link: [{ rel: 'icon', href: 'data:,' }, { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
      meta: [
        { name: 'description', content: 'Research tool for exploring how assets move throughout the year, including U.S. presidential election-cycle patterns.' },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'easeason' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
})
