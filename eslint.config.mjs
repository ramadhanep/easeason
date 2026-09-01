// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['app/components/ui/**'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
  // Your custom configs here
)
