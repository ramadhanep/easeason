import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    research: defineCollection({
      type: 'page',
      source: 'research/**/*.md',
      fields: {
        title: { type: 'string' },
        description: { type: 'string' },
        publishedOn: { type: 'date' },
        tags: { type: 'array' },
      },
    }),
  },
})
